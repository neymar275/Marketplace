import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Marketplace Database Seed...\n');

  try {
    // Seed Categories with stable IDs
    const categories = [
      {
        id: '59b418a0-7217-4749-8c9f-3158c5028791',
        name: 'Complete Bikes',
        slug: 'bikes',
        icon: 'bike',
      },
      {
        id: 'a93b48f0-1534-406c-829d-4054dbcf131e',
        name: 'Frames & Forks',
        slug: 'frames',
        icon: 'frame',
      },
      {
        id: 'd8f52136-11f8-45e3-982c-7b419b480f2d',
        name: 'Components',
        slug: 'parts',
        icon: 'tool',
      },
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: cat,
      });
      console.log(`✅ Category: ${cat.name}`);
    }

    // Seed Test User
    const testUser = await prisma.user.upsert({
      where: { email: 'test@seller.com' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@seller.com',
        name: 'Test Seller',
      },
    });

    console.log(`✅ Test User created → ID: ${testUser.id}`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nYou can now create listings using sellerId:', testUser.id);

  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();