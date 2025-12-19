const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.vote.deleteMany();
  await prisma.candidate.deleteMany();

  // Create default admin if not exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: 'admin@wytu.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.create({
      data: {
        email: 'admin@wytu.com',
        password: hashedPassword,
        name: 'Admin',
      },
    });
    console.log('✅ Default admin created:');
    console.log('   Email: admin@wytu.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  Please change this password after first login!');
  }

  // Seed King candidates
  // Note: Place actual photos in public/uploads/candidates/ folder
  const kings = [
    { name: 'King Candidate 1', category: 'king', photoUrl: '/uploads/candidates/king1.jpg' },
    { name: 'King Candidate 2', category: 'king', photoUrl: '/uploads/candidates/king2.jpg' },
    { name: 'King Candidate 3', category: 'king', photoUrl: '/uploads/candidates/king3.jpg' },
  ];

  // Seed Queen candidates
  const queens = [
    { name: 'Queen Candidate 1', category: 'queen', photoUrl: '/uploads/candidates/queen1.jpg' },
    { name: 'Queen Candidate 2', category: 'queen', photoUrl: '/uploads/candidates/queen2.jpg' },
    { name: 'Queen Candidate 3', category: 'queen', photoUrl: '/uploads/candidates/queen3.jpg' },
  ];

  for (const king of kings) {
    await prisma.candidate.create({ data: king });
  }

  for (const queen of queens) {
    await prisma.candidate.create({ data: queen });
  }

  console.log('✅ Database seeded successfully!');
  console.log('   - 3 King candidates');
  console.log('   - 3 Queen candidates');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
