import { PrismaClient, Decision } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupBli03Reviews() {
  console.log('Starting cleanup of BLI03 REQUEST_CHANGES reviews...');

  try {
    // Find all applications with BLI03 submissions
    const applications = await prisma.application.findMany({
      where: {
        formResponses: {
          some: {
            formTypeEnum: 'BLI_03',
          },
        },
      },
      include: {
        reviews: {
          where: {
            decision: Decision.REQUEST_CHANGES,
          },
        },
      },
    });

    console.log(`Found ${applications.length} applications with BLI03 submissions`);

    let totalDeleted = 0;
    for (const app of applications) {
      if (app.reviews.length > 0) {
        const deleted = await prisma.review.deleteMany({
          where: {
            applicationId: app.id,
            decision: Decision.REQUEST_CHANGES,
          },
        });
        totalDeleted += deleted.count;
        console.log(`Deleted ${deleted.count} REQUEST_CHANGES reviews for application ${app.id}`);
      }
    }

    console.log(`\nCleanup complete! Deleted ${totalDeleted} REQUEST_CHANGES reviews.`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupBli03Reviews();
