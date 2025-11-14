/**
 * @summary
 * Weather controller for handling temperature display requests.
 * Provides endpoints for retrieving current temperature data from external weather API.
 *
 * @module api/v1/external/weather/controller
 */

import { Request, Response, NextFunction } from 'express';
import { weatherGet } from '@/services/weather';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * @api {get} /api/v1/external/weather Get Current Weather
 * @apiName GetWeather
 * @apiGroup Weather
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves current weather data including temperature for a specified location
 *
 * @apiParam {String} location Location name (city, coordinates, or IP address)
 * @apiParam {String} [unit=celsius] Temperature unit (celsius or fahrenheit)
 *
 * @apiSuccess {Number} temperature Current temperature value
 * @apiSuccess {String} unit Temperature unit (°C or °F)
 * @apiSuccess {String} location Location name
 * @apiSuccess {String} timestamp Last update timestamp
 * @apiSuccess {String} status Connection status
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} ExternalAPIError Weather API request failed
 * @apiError {String} ServerError Internal server error
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { location, unit = 'celsius' } = req.query;

    /**
     * @validation Validate required location parameter
     * @throw {locationRequired}
     */
    if (!location || typeof location !== 'string') {
      res.status(400).json(errorResponse('locationRequired', 'VALIDATION_ERROR'));
      return;
    }

    /**
     * @validation Validate unit parameter
     * @throw {invalidUnit}
     */
    if (unit !== 'celsius' && unit !== 'fahrenheit') {
      res.status(400).json(errorResponse('invalidUnit', 'VALIDATION_ERROR'));
      return;
    }

    /**
     * @rule {fn-weather-retrieval} Retrieve weather data from external API
     */
    const weatherData = await weatherGet({
      location: location as string,
      unit: unit as string,
    });

    res.json(successResponse(weatherData));
  } catch (error: any) {
    if (error.code === 'WEATHER_API_ERROR') {
      res.status(503).json(errorResponse(error.message, 'EXTERNAL_API_ERROR'));
    } else if (error.code === 'LOCATION_NOT_FOUND') {
      res.status(404).json(errorResponse(error.message, 'LOCATION_NOT_FOUND'));
    } else {
      next(error);
    }
  }
}
