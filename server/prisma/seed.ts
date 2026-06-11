import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// 1. Explicitly load the .env file so Prisma can see DATABASE_URL naturally
dotenv.config();

// 2. Use the standard empty constructor
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories...');
  
  // Create categories in the database
  const bikes = await prisma.category.create({ data: { name: 'Complete Bikes', slug: 'bikes' } });
  const frames = await prisma.category.create({ data: { name: 'Frames & Forks', slug: 'frames' } });
  const parts = await prisma.category.create({ data: { name: 'Components', slug: 'parts' } });

  console.log(`\n✅ Database Seeded! Copy these 3 lines to your frontend:\n`);
  console.log(`{ id: '${bikes.id}', name: 'Complete Bikes' },`);
  console.log(`{ id: '${frames.id}', name: 'Frames & Forks' },`);
  console.log(`{ id: '${parts.id}', name: 'Components' }`);
}

main().finally(async () => {
  await prisma.$disconnect();
});