import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking coordinator campus data...\n');

  const coordinators = await prisma.user.findMany({
    where: {
      role: 'COORDINATOR',
    },
    select: {
      name: true,
      email: true,
      program: true,
      faculty: true,
      campus: true,
      campusAddress: true,
      campusCity: true,
      campusPhone: true,
      universityBranch: true,
    },
  });

  if (coordinators.length === 0) {
    console.log('No coordinators found in database.');
    return;
  }

  coordinators.forEach((coordinator, index) => {
    console.log(`\n=== Coordinator ${index + 1} ===`);
    console.log(`Name: ${coordinator.name}`);
    console.log(`Email: ${coordinator.email}`);
    console.log(`Program: ${coordinator.program || 'N/A'}`);
    console.log(`Faculty: ${coordinator.faculty || 'NOT SET ❌'}`);
    console.log(`Campus: ${coordinator.campus || 'NOT SET ❌'}`);
    console.log(`Campus Address: ${coordinator.campusAddress || 'NOT SET ❌'}`);
    console.log(`Campus City: ${coordinator.campusCity || 'NOT SET ❌'}`);
    console.log(`Campus Phone: ${coordinator.campusPhone || 'NOT SET ❌'}`);
    console.log(`University Branch: ${coordinator.universityBranch || 'NOT SET ❌'}`);
    
    const hasAllCampusData = coordinator.faculty && coordinator.campus && 
                             coordinator.campusAddress && coordinator.campusCity && 
                             coordinator.campusPhone && coordinator.universityBranch;
    console.log(`Status: ${hasAllCampusData ? '✅ Complete' : '⚠️ Incomplete'}`);
  });

  console.log(`\n\nTotal coordinators: ${coordinators.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
