/**
 * @summary
 * Type definitions for weather service.
 * Defines interfaces and types for weather data operations.
 *
 * @module services/weather/weatherTypes
 */

/**
 * @interface WeatherGetRequest
 * @description Request parameters for weather data retrieval
 *
 * @property {string} location - Location identifier (city name, coordinates, or IP)
 * @property {string} unit - Temperature unit (celsius or fahrenheit)
 */
export interface WeatherGetRequest {
  location: string;
  unit: string;
}

/**
 * @interface WeatherResponse
 * @description Weather data response structure
 *
 * @property {number} temperature - Current temperature value
 * @property {string} unit - Temperature unit symbol (°C or °F)
 * @property {string} location - Formatted location name
 * @property {string} timestamp - Last update timestamp (ISO 8601)
 * @property {string} status - Connection status (online, offline, outdated)
 */
export interface WeatherResponse {
  temperature: number;
  unit: string;
  location: string;
  timestamp: string;
  status: string;
}

/**
 * @interface CachedWeatherData
 * @description Cached weather data structure for offline support
 *
 * @property {number} temperature - Cached temperature value
 * @property {string} unit - Temperature unit
 * @property {string} location - Location name
 * @property {string} timestamp - Cache timestamp
 * @property {number} cacheTime - Cache creation time (Unix timestamp)
 */
export interface CachedWeatherData {
  temperature: number;
  unit: string;
  location: string;
  timestamp: string;
  cacheTime: number;
}

/**
 * @interface ExternalWeatherAPIResponse
 * @description External weather API response structure
 *
 * @property {object} current - Current weather data
 * @property {object} location - Location information
 */
export interface ExternalWeatherAPIResponse {
  current: {
    temp_c: number;
    temp_f: number;
    last_updated: string;
  };
  location: {
    name: string;
    region: string;
    country: string;
  };
}
