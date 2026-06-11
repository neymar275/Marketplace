require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories...');
  try {
    const bikes = await prisma.category.create({ data: { name: 'Complete Bikes', slug: 'bikes' } });
    const frames = await prisma.category.create({ data: { name: 'Frames & Forks', slug: 'frames' } });
    const parts = await prisma.category.create({ data: { name: 'Components', slug: 'parts' } });

    console.log(`\n✅ Database Seeded! Copy these 3 lines to your frontend:\n`);
    console.log(`{ id: '${bikes.id}', name: 'Complete Bikes' },`);
    console.log(`{ id: '${frames.id}', name: 'Frames & Forks' },`);
    console.log(`{ id: '${parts.id}', name: 'Components' }`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n(If it says "Unique constraint failed", it means the categories are already in your database! Just look at Prisma Studio to grab their IDs).');
  } finally {
    await prisma.$disconnect();
  }
}

main();