import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSessions() {
  try {
    // Get all sessions with their coordinators and students
    const sessions = await prisma.session.findMany({
      include: {
        coordinator: true,
        studentSessions: {
          include: {
            user: true
          }
        },
        applications: {
          include: {
            user: true,
            documents: true
          }
        }
      }
    });

    console.log(`\n=== SESSION SUMMARY ===`);
    console.log(`Total Sessions: ${sessions.length}\n`);

    sessions.forEach((session, index) => {
      console.log(`\n${index + 1}. Session: ${session.name} (${session.year} - Semester ${session.semester})`);
      console.log(`   Active: ${session.isActive}`);
      console.log(`   Coordinator: ${session.coordinator?.name || 'Not assigned'} (${session.coordinator?.email || 'N/A'})`);
      console.log(`   Students enrolled: ${session.studentSessions.length}`);
      console.log(`   Applications: ${session.applications.length}`);
      
      if (session.studentSessions.length > 0) {
        console.log(`\n   Enrolled Students:`);
        session.studentSessions.forEach((ss, i) => {
          console.log(`     ${i + 1}. ${ss.user.name} (${ss.user.matricNo}) - ${ss.isEligible ? 'Eligible' : 'Not eligible'}`);
        });
      }

      if (session.applications.length > 0) {
        console.log(`\n   Applications:`);
        session.applications.forEach((app, i) => {
          const bli04 = app.documents.find(d => d.type === 'BLI_04');
          console.log(`     ${i + 1}. ${app.user.name} - Status: ${app.status} - BLI-04: ${bli04 ? '✓' : '✗'}`);
        });
      }
    });

    // Get all coordinators
    const coordinators = await prisma.user.findMany({
      where: { role: 'COORDINATOR' },
      include: {
        coordinatedSessions: {
          include: {
            studentSessions: true,
            applications: {
              include: {
                documents: true
              }
            }
          }
        }
      }
    });

    console.log(`\n\n=== COORDINATOR SUMMARY ===`);
    coordinators.forEach(coord => {
      const totalStudents = coord.coordinatedSessions.reduce((sum, s) => sum + s.studentSessions.length, 0);
      const totalApps = coord.coordinatedSessions.reduce((sum, s) => sum + s.applications.length, 0);
      const completedBLI04 = coord.coordinatedSessions.reduce((sum, s) => {
        return sum + s.applications.filter(app => 
          app.documents.some(d => d.type === 'BLI_04')
        ).length;
      }, 0);

      console.log(`\n${coord.name} (${coord.email})`);
      console.log(`  Sessions: ${coord.coordinatedSessions.length}`);
      console.log(`  Total Students: ${totalStudents}`);
      console.log(`  Total Applications: ${totalApps}`);
      console.log(`  Completed BLI-04: ${completedBLI04}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSessions();
