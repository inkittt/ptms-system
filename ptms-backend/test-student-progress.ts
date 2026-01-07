import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStudentProgress() {
  try {
    // Get the active session
    const session = await prisma.session.findFirst({
      where: { isActive: true },
    });

    if (!session) {
      console.log('No active session found');
      return;
    }

    console.log(`\n=== Student Progress for Session: ${session.name} ===\n`);

    // Get all students in the session with their applications and documents
    const studentSessions = await prisma.studentSession.findMany({
      where: { sessionId: session.id },
      include: {
        user: {
          include: {
            applications: {
              where: { sessionId: session.id },
              include: {
                documents: true,
              },
            },
          },
        },
      },
    });

    const students = studentSessions.map((ss) => {
      const student = ss.user;
      const application = student.applications[0];

      let status = 'Not Started';
      let progress = 0;
      let completedSteps = 0;
      const totalSteps = 7;

      if (!application) {
        status = 'Not Started';
        progress = 0;
      } else if (application.status === 'DRAFT') {
        status = 'Not Started';
        progress = 0;
      } else if (application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW') {
        status = 'Application Submitted';
        const documentTypes = ['BLI_01', 'BLI_02', 'BLI_03', 'BLI_04', 'BLI_05', 'BLI_06', 'BLI_07'];
        completedSteps = documentTypes.filter(type => 
          application.documents.some(doc => doc.type === type)
        ).length;
        progress = Math.round((completedSteps / totalSteps) * 100);
      } else if (application.status === 'APPROVED') {
        const hasBLI04 = application.documents.some(
          doc => doc.type === 'BLI_04' && doc.status === 'SIGNED'
        );
        
        if (hasBLI04) {
          status = 'Completed';
          const documentTypes = ['BLI_01', 'BLI_02', 'BLI_03', 'BLI_04', 'BLI_05', 'BLI_06', 'BLI_07'];
          completedSteps = documentTypes.filter(type => 
            application.documents.some(doc => doc.type === type && doc.status === 'SIGNED')
          ).length;
          progress = Math.round((completedSteps / totalSteps) * 100);
        } else {
          status = 'Approved & Ongoing';
          const documentTypes = ['BLI_01', 'BLI_02', 'BLI_03', 'BLI_04', 'BLI_05', 'BLI_06', 'BLI_07'];
          completedSteps = documentTypes.filter(type => 
            application.documents.some(doc => doc.type === type)
          ).length;
          progress = Math.round((completedSteps / totalSteps) * 100);
        }
      }

      return {
        name: student.name,
        matricNo: student.matricNo,
        program: student.program,
        status,
        progress,
        completedSteps,
        totalSteps,
      };
    });

    // Display student list
    console.log('Student Progress Details:\n');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.matricNo})`);
      console.log(`   Program: ${student.program || 'N/A'}`);
      console.log(`   Status: ${student.status}`);
      console.log(`   Progress: ${student.progress}% (${student.completedSteps}/${student.totalSteps} documents)`);
      console.log('');
    });

    // Calculate summary
    const notStarted = students.filter(s => s.status === 'Not Started').length;
    const submitted = students.filter(s => s.status === 'Application Submitted').length;
    const ongoing = students.filter(s => s.status === 'Approved & Ongoing').length;
    const completed = students.filter(s => s.status === 'Completed').length;

    console.log('\n=== Summary ===');
    console.log(`Total Students: ${students.length}`);
    console.log(`Not Started: ${notStarted}`);
    console.log(`Application Submitted: ${submitted}`);
    console.log(`Approved & Ongoing: ${ongoing}`);
    console.log(`Completed: ${completed}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStudentProgress();
