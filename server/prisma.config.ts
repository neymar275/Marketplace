import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';
import path from 'path';

// 1. Force load the root .env file
// 2. Override any existing Windows system environment variables
dotenv.config({ 
  path: path.resolve(__dirname, '../.env'), 
  override: true 
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});