import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testReports() {
  try {
    // Get the active session
    const session = await prisma.session.findFirst({
      where: { isActive: true },
      include: {
        coordinator: true,
      }
    });

    if (!session) {
      console.log('No active session found');
      return;
    }

    console.log(`\n=== Testing Reports for Session: ${session.name} ===`);
    console.log(`Coordinator: ${session.coordinator?.name}\n`);

    // Count students in session
    const totalStudents = await prisma.studentSession.count({
      where: { sessionId: session.id },
    });

    const eligibleStudents = await prisma.studentSession.count({
      where: {
        sessionId: session.id,
        isEligible: true,
      },
    });

    // Count applications
    const totalApplications = await prisma.application.count({
      where: { sessionId: session.id },
    });

    const approvedApplications = await prisma.application.count({
      where: {
        sessionId: session.id,
        status: 'APPROVED',
      },
    });

    const pendingReview = await prisma.application.count({
      where: {
        sessionId: session.id,
        status: 'UNDER_REVIEW',
      },
    });

    // Count completed internships (students with BLI-04 signed)
    const completedInternships = await prisma.application.count({
      where: {
        sessionId: session.id,
        status: 'APPROVED',
        documents: {
          some: {
            type: 'BLI_04',
            status: 'SIGNED',
          },
        },
      },
    });

    const ongoingInternships = approvedApplications - completedInternships;

    console.log('📊 Overview Stats:');
    console.log(`   Total Students: ${totalStudents}`);
    console.log(`   Eligible Students: ${eligibleStudents}`);
    console.log(`   Eligibility Rate: ${totalStudents > 0 ? Math.round((eligibleStudents / totalStudents) * 100) : 0}%`);
    console.log('');
    console.log(`   Total Applications: ${totalApplications}`);
    console.log(`   Approved: ${approvedApplications}`);
    console.log(`   Pending Review: ${pendingReview}`);
    console.log(`   Approval Rate: ${totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0}%`);
    console.log('');
    console.log(`   Completed Internships (BLI-04 done): ${completedInternships}`);
    console.log(`   Ongoing Internships: ${ongoingInternships}`);
    console.log(`   Completion Rate: ${totalStudents > 0 ? Math.round((completedInternships / totalStudents) * 100) : 0}%`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testReports();
