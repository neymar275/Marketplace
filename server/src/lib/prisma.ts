import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Force load the root .env file cleanly across Windows/Unix file systems
dotenv.config({ 
  path: path.resolve(__dirname, '../../../.env'),
  override: true 
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('CRITICAL DB ERROR: DATABASE_URL environment variable is completely missing or unread.');
}

// 2. Instantiate the pure-JS Prisma 7 PostgreSQL driver adapter
const adapter = new PrismaPg({ connectionString });

// 3. Maintain global state across hot-reloads during development
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}