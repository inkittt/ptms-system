import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating old coordinators with campus data...\n');

  // Update coordinators without campus data
  const result = await prisma.user.updateMany({
    where: {
      role: 'COORDINATOR',
      campus: null,
    },
    data: {
      faculty: 'Fakulti Sains Komputer dan\nMatematik',
      campus: 'Kampus Jasin',
      campusAddress: '77300 Merlimau, Jasin',
      campusCity: 'Melaka Bandaraya Bersejarah',
      campusPhone: '(+606) 2645000',
      universityBranch: 'Universiti Teknologi MARA(Melaka)',
    },
  });

  console.log(`✅ Updated ${result.count} coordinators with campus data`);

  // Verify the update
  const coordinators = await prisma.user.findMany({
    where: {
      role: 'COORDINATOR',
    },
    select: {
      name: true,
      email: true,
      campus: true,
    },
  });

  console.log('\n=== All Coordinators ===');
  coordinators.forEach((coord, index) => {
    const status = coord.campus ? '✅' : '❌';
    console.log(`${index + 1}. ${coord.name} (${coord.email}) ${status}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
