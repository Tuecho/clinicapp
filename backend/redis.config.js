/**
 * Redis Configuration Module
 * Provides utilities for Redis caching and queue management
 */

import { createClient } from 'redis';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'redis_clinic',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error('Max retries exceeded');
      return Math.min(retries * 50, 500);
    }
  }
};

/**
 * Cache key patterns for organized key management
 */
export const CACHE_KEYS = {
  // Clinic data
  CLINIC_CLIENTS: (userId) => `clinic:clients:${userId}`,
  CLINIC_SERVICES: (userId) => `clinic:services:${userId}`,
  CLINIC_APPOINTMENTS: (userId, from, to) => `clinic:appointments:${userId}:${from}:${to}`,
  CLINIC_DASHBOARD: (userId) => `clinic:dashboard:${userId}`,
  
  // User sessions
  USER_SESSION: (userId) => `session:${userId}`,
  
  // Queues
  EMAIL_QUEUE: 'queue:emails',
  REMINDER_QUEUE: 'queue:reminders'
};

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 900,     // 15 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400 // 24 hours
};

/**
 * Create and initialize Redis client
 */
export async function initializeRedis() {
  const client = createClient(redisConfig);
  
  client.on('error', (err) => console.error('Redis Client Error:', err));
  client.on('connect', () => console.log('✅ Connected to Redis'));
  client.on('ready', () => console.log('✅ Redis client is ready'));
  client.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));
  
  try {
    await client.connect();
    // Test connection
    await client.ping();
    console.log('✅ Redis ping successful');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    throw err;
  }
  
  return client;
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(client) {
  try {
    const pong = await client.ping();
    return pong === 'PONG';
  } catch (err) {
    console.error('Redis health check failed:', err);
    return false;
  }
}

export default redisConfig;
