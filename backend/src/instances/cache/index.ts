/**
 * @summary
 * In-memory cache instance for weather data.
 * Provides simple key-value storage with TTL support for offline functionality.
 *
 * @module instances/cache
 */

import { config } from '@/config';

/**
 * @interface CacheEntry
 * @description Cache entry structure with expiration
 *
 * @property {any} value - Cached value
 * @property {number} expiry - Expiration timestamp
 */
interface CacheEntry<T> {
  value: T;
  expiry: number;
}

/**
 * @class SimpleCache
 * @description Simple in-memory cache implementation
 */
class SimpleCache {
  private cache: Map<string, CacheEntry<any>>;
  private ttl: number;

  constructor(ttl: number) {
    this.cache = new Map();
    this.ttl = ttl * 1000;
    this.startCleanup();
  }

  /**
   * @summary
   * Stores value in cache with TTL
   *
   * @function set
   *
   * @param {string} key - Cache key
   * @param {T} value - Value to cache
   *
   * @returns {void}
   */
  set<T>(key: string, value: T): void {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
  }

  /**
   * @summary
   * Retrieves value from cache
   *
   * @function get
   *
   * @param {string} key - Cache key
   *
   * @returns {T | undefined} Cached value or undefined if expired/not found
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * @summary
   * Removes value from cache
   *
   * @function delete
   *
   * @param {string} key - Cache key
   *
   * @returns {void}
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * @summary
   * Clears all cache entries
   *
   * @function clear
   *
   * @returns {void}
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * @summary
   * Starts periodic cleanup of expired entries
   *
   * @function startCleanup
   *
   * @returns {void}
   */
  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiry) {
          this.cache.delete(key);
        }
      }
    }, config.cache.checkPeriod * 1000);
  }
}

export const weatherCache = new SimpleCache(config.cache.ttl);
