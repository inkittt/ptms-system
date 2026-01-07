import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStudents() {
  try {
    // Get all students
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        applications: {
          include: {
            documents: {
              orderBy: { type: 'asc' }
            }
          }
        }
      }
    });

    console.log(`\n=== STUDENT ENROLLMENT SUMMARY ===`);
    console.log(`Total Students: ${students.length}\n`);

    students.forEach((student, index) => {
      console.log(`\n${index + 1}. ${student.name} (${student.matricNo || 'No Matric'})`);
      console.log(`   Email: ${student.email}`);
      
      if (student.applications.length === 0) {
        console.log(`   Status: No application`);
      } else {
        student.applications.forEach((app, appIndex) => {
          console.log(`   Application ${appIndex + 1}:`);
          console.log(`     Status: ${app.status}`);
          console.log(`     Documents submitted:`);
          
          const docTypes = ['BLI_01', 'BLI_02', 'BLI_03', 'BLI_04', 'BLI_05', 'BLI_06', 'BLI_07'];
          const submittedDocs = new Set(app.documents.map(d => d.type));
          
          docTypes.forEach(docType => {
            const hasDoc = submittedDocs.has(docType as any);
            const docs = app.documents.filter(d => d.type === docType);
            if (hasDoc) {
              console.log(`       ✓ ${docType} (${docs[0].status})`);
            } else {
              console.log(`       ✗ ${docType}`);
            }
          });
        });
      }
    });

    // Summary statistics
    const studentsWithBLI04 = students.filter(s => 
      s.applications.some(app => 
        app.documents.some(doc => doc.type === 'BLI_04')
      )
    );

    console.log(`\n\n=== SUMMARY ===`);
    console.log(`Total Students: ${students.length}`);
    console.log(`Students with BLI-04 submitted: ${studentsWithBLI04.length}`);
    console.log(`Students without BLI-04: ${students.length - studentsWithBLI04.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
