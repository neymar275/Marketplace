import { createClient } from 'redis';

export const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis connected successfully'));

// We will explicitly connect to Redis in server.ts