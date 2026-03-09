import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    // Hash the admin password
    const hashedPassword = await bcrypt.hash('securePassword123', 10);

    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@nutreopak.com' },
      update: {
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
      },
      create: {
        email: 'admin@nutreopak.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
      },
    });

    console.log('✅ Admin user seeded successfully:', admin.email);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
