import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestSession() {
  console.log('Creating test session for second coordinator...');

  // Get the second coordinator (Dr. Sarah Johnson)
  const coordinator = await prisma.user.findFirst({
    where: { 
      role: 'COORDINATOR',
      email: 'sarah.johnson@university.edu'
    },
  });

  if (!coordinator) {
    console.error('Coordinator not found');
    return;
  }

  console.log(`Found coordinator: ${coordinator.name} (${coordinator.email})`);

  // Create a new session for this coordinator
  const session = await prisma.session.create({
    data: {
      name: 'rest1',
      year: 2025,
      semester: 1,
      minCredits: 113,
      minWeeks: 8,
      maxWeeks: 14,
      isActive: true,
      coordinatorId: coordinator.id,
      deadlinesJSON: {
        applicationDeadline: '2025-03-31',
        bli03Deadline: '2025-04-15',
        reportingDeadline: '2025-05-01',
      },
    },
  });

  console.log(`Created session: ${session.name} (${session.id})`);
  console.log(`Assigned to coordinator: ${coordinator.name}`);
}

createTestSession()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
