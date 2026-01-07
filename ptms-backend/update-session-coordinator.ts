import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSessionCoordinator() {
  console.log('Updating session with coordinator...');

  // Get the first coordinator
  const coordinator = await prisma.user.findFirst({
    where: { role: 'COORDINATOR' },
  });

  if (!coordinator) {
    console.error('No coordinator found in database');
    return;
  }

  console.log(`Found coordinator: ${coordinator.name} (${coordinator.email})`);

  // Get all sessions without a coordinator
  const sessionsToUpdate = await prisma.session.findMany({
    where: {
      coordinatorId: null,
    },
  });

  // Update each session individually using raw query to set coordinatorId
  let updateCount = 0;
  for (const session of sessionsToUpdate) {
    await prisma.$executeRaw`
      UPDATE "Session" 
      SET "coordinatorId" = ${coordinator.id}::uuid, "updatedAt" = NOW()
      WHERE id = ${session.id}::uuid
    `;
    updateCount++;
  }

  console.log(`Updated ${updateCount} session(s) with coordinator ${coordinator.name}`);
}

updateSessionCoordinator()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
