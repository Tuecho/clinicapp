/**
 * Cache Management Utilities
 * Provides helper functions for Redis operations
 */

export class CacheManager {
  constructor(redisClient) {
    this.client = redisClient;
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null if not found
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error(`Cache get error for key ${key}:`, err);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300)
   */
  async set(key, value, ttl = 300) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err) {
      console.error(`Cache set error for key ${key}:`, err);
    }
  }

  /**
   * Delete single cache key
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error(`Cache delete error for key ${key}:`, err);
    }
  }

  /**
   * Delete multiple cache keys by pattern
   * @param {string} pattern - Key pattern (supports * wildcard)
   */
  async delPattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`Deleted ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (err) {
      console.error(`Cache pattern delete error for pattern ${pattern}:`, err);
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      await this.client.flushDb();
      console.log('Cache cleared');
    } catch (err) {
      console.error('Cache clear error:', err);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const info = await this.client.info('keyspace');
      const keys = await this.client.keys('*');
      return {
        totalKeys: keys.length,
        dbSize: await this.client.dbSize(),
        info
      };
    } catch (err) {
      console.error('Cache stats error:', err);
      return null;
    }
  }

  /**
   * Increment counter
   * @param {string} key - Counter key
   * @param {number} increment - Amount to increment (default: 1)
   */
  async increment(key, increment = 1) {
    try {
      return await this.client.incrBy(key, increment);
    } catch (err) {
      console.error(`Cache increment error for key ${key}:`, err);
      return null;
    }
  }

  /**
   * Add to queue (list)
   * @param {string} key - Queue key
   * @param {any} value - Value to add
   */
  async queueAdd(key, value) {
    try {
      await this.client.rPush(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Queue add error for key ${key}:`, err);
    }
  }

  /**
   * Get from queue (list) - FIFO
   * @param {string} key - Queue key
   */
  async queueGet(key) {
    try {
      const value = await this.client.lPop(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error(`Queue get error for key ${key}:`, err);
      return null;
    }
  }

  /**
   * Get queue length
   * @param {string} key - Queue key
   */
  async queueLength(key) {
    try {
      return await this.client.lLen(key);
    } catch (err) {
      console.error(`Queue length error for key ${key}:`, err);
      return 0;
    }
  }

  /**
   * Set expiration on key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   */
  async expire(key, ttl) {
    try {
      await this.client.expire(key, ttl);
    } catch (err) {
      console.error(`Cache expire error for key ${key}:`, err);
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   */
  async exists(key) {
    try {
      return (await this.client.exists(key)) === 1;
    } catch (err) {
      console.error(`Cache exists error for key ${key}:`, err);
      return false;
    }
  }

  /**
   * Get TTL of key
   * @param {string} key - Cache key
   */
  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (err) {
      console.error(`Cache ttl error for key ${key}:`, err);
      return -1;
    }
  }
}

/**
 * Simple cache wrapper for use in middleware
 */
export const createCacheMiddleware = (cacheManager) => {
  return {
    // Get with fallback
    getOrCompute: async (key, computeFn, ttl = 300) => {
      let value = await cacheManager.get(key);
      if (value === null) {
        value = await computeFn();
        await cacheManager.set(key, value, ttl);
      }
      return value;
    },

    // Invalidate related caches
    invalidateUser: async (userId) => {
      await cacheManager.delPattern(`clinic:clients:${userId}`);
      await cacheManager.delPattern(`clinic:services:${userId}`);
      await cacheManager.delPattern(`clinic:appointments:${userId}:*`);
      await cacheManager.del(`clinic:dashboard:${userId}`);
      await cacheManager.del(`session:${userId}`);
    }
  };
};

export default CacheManager;
