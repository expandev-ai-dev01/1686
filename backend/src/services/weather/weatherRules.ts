/**
 * @summary
 * Weather service business logic.
 * Handles weather data retrieval from external API with caching and offline support.
 *
 * @module services/weather/weatherRules
 */

import { config } from '@/config';
import { weatherCache } from '@/instances/cache';
import {
  WeatherGetRequest,
  WeatherResponse,
  CachedWeatherData,
  ExternalWeatherAPIResponse,
} from './weatherTypes';

/**
 * @summary
 * Retrieves current weather data for specified location
 *
 * @function weatherGet
 *
 * @param {WeatherGetRequest} params - Weather request parameters
 * @param {string} params.location - Location identifier
 * @param {string} params.unit - Temperature unit (celsius or fahrenheit)
 *
 * @returns {Promise<WeatherResponse>} Weather data response
 *
 * @throws {Error} WEATHER_API_ERROR - External API request failed
 * @throws {Error} LOCATION_NOT_FOUND - Location not found
 */
export async function weatherGet(params: WeatherGetRequest): Promise<WeatherResponse> {
  const { location, unit } = params;
  const cacheKey = `weather_${location}_${unit}`;

  /**
   * @rule {fn-cache-check} Check cache for recent data
   */
  const cachedData = weatherCache.get<CachedWeatherData>(cacheKey);
  const now = Date.now();

  if (cachedData) {
    const cacheAge = now - cachedData.cacheTime;
    const oneHour = 60 * 60 * 1000;

    /**
     * @rule {fn-cache-freshness} Return cached data if less than 15 minutes old
     */
    if (cacheAge < 15 * 60 * 1000) {
      return {
        temperature: cachedData.temperature,
        unit: cachedData.unit,
        location: cachedData.location,
        timestamp: cachedData.timestamp,
        status: 'online',
      };
    }

    /**
     * @rule {fn-cache-outdated} Mark data as outdated if more than 1 hour old
     */
    if (cacheAge > oneHour) {
      try {
        const freshData = await fetchWeatherFromAPI(location, unit);
        return freshData;
      } catch (error) {
        return {
          temperature: cachedData.temperature,
          unit: cachedData.unit,
          location: cachedData.location,
          timestamp: cachedData.timestamp,
          status: 'outdated',
        };
      }
    }
  }

  /**
   * @rule {fn-api-fetch} Fetch fresh data from external API
   */
  try {
    const weatherData = await fetchWeatherFromAPI(location, unit);
    return weatherData;
  } catch (error: any) {
    /**
     * @rule {fn-offline-fallback} Return cached data if API fails
     */
    if (cachedData) {
      return {
        temperature: cachedData.temperature,
        unit: cachedData.unit,
        location: cachedData.location,
        timestamp: cachedData.timestamp,
        status: 'offline',
      };
    }

    throw error;
  }
}

/**
 * @summary
 * Fetches weather data from external API
 *
 * @function fetchWeatherFromAPI
 *
 * @param {string} location - Location identifier
 * @param {string} unit - Temperature unit
 *
 * @returns {Promise<WeatherResponse>} Weather data response
 *
 * @throws {Error} WEATHER_API_ERROR - API request failed
 * @throws {Error} LOCATION_NOT_FOUND - Location not found
 */
async function fetchWeatherFromAPI(location: string, unit: string): Promise<WeatherResponse> {
  const apiKey = config.weather.apiKey;
  const apiUrl = config.weather.apiUrl;

  /**
   * @validation Validate API key configuration
   * @throw {weatherApiKeyNotConfigured}
   */
  if (!apiKey) {
    const error: any = new Error('weatherApiKeyNotConfigured');
    error.code = 'WEATHER_API_ERROR';
    throw error;
  }

  try {
    const url = `${apiUrl}/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 400) {
        const error: any = new Error('locationNotFound');
        error.code = 'LOCATION_NOT_FOUND';
        throw error;
      }

      const error: any = new Error('weatherApiRequestFailed');
      error.code = 'WEATHER_API_ERROR';
      throw error;
    }

    const data: ExternalWeatherAPIResponse = await response.json();

    /**
     * @rule {fn-temperature-conversion} Extract temperature based on unit
     */
    const temperature = unit === 'fahrenheit' ? data.current.temp_f : data.current.temp_c;
    const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';
    const formattedLocation = `${data.location.name}, ${
      data.location.region || data.location.country
    }`;
    const timestamp = new Date(data.current.last_updated).toISOString();

    /**
     * @validation Validate temperature range
     * @throw {temperatureOutOfRange}
     */
    if (temperature < -90 || temperature > 60) {
      const error: any = new Error('temperatureOutOfRange');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const weatherResponse: WeatherResponse = {
      temperature: Math.round(temperature * 10) / 10,
      unit: unitSymbol,
      location: formattedLocation,
      timestamp,
      status: 'online',
    };

    /**
     * @rule {fn-cache-update} Store data in cache
     */
    const cacheKey = `weather_${location}_${unit}`;
    const cacheData: CachedWeatherData = {
      temperature: weatherResponse.temperature,
      unit: weatherResponse.unit,
      location: weatherResponse.location,
      timestamp: weatherResponse.timestamp,
      cacheTime: Date.now(),
    };
    weatherCache.set(cacheKey, cacheData);

    return weatherResponse;
  } catch (error: any) {
    if (error.code) {
      throw error;
    }

    const apiError: any = new Error('weatherApiRequestFailed');
    apiError.code = 'WEATHER_API_ERROR';
    throw apiError;
  }
}
