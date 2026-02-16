import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Populating production-ready fields...\n');

  // Update existing students with sample IC numbers
  console.log('Updating students with IC numbers...');
  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      icNumber: null,
    },
    select: {
      id: true,
      matricNo: true,
      name: true,
    },
  });

  let studentCount = 0;
  for (const student of students) {
    // Generate a realistic Malaysian IC number (format: YYMMDD-PB-###G)
    const year = '03'; // Born in 2003
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const birthPlace = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'][Math.floor(Math.random() * 14)];
    const serial = String(Math.floor(Math.random() * 9000) + 1000);
    const icNumber = `${year}${month}${day}-${birthPlace}-${serial}`;

    await prisma.user.update({
      where: { id: student.id },
      data: { icNumber },
    });
    studentCount++;
  }
  console.log(`✅ Updated ${studentCount} students with IC numbers`);

  // Update existing sessions with training dates and reference numbers
  console.log('\nUpdating sessions with training dates and reference numbers...');
  const sessions = await prisma.session.findMany({
    where: {
      OR: [
        { trainingStartDate: null },
        { referenceNumberFormat: null },
      ],
    },
    select: {
      id: true,
      name: true,
      year: true,
      semester: true,
    },
  });

  let sessionCount = 0;
  for (const session of sessions) {
    // Set training dates based on semester
    let startDate: Date;
    let endDate: Date;
    
    if (session.semester === 1) {
      // Semester 1: September to December
      startDate = new Date(session.year, 8, 15); // Sept 15
      endDate = new Date(session.year, 11, 19); // Dec 19
    } else {
      // Semester 2: February to May
      startDate = new Date(session.year, 1, 15); // Feb 15
      endDate = new Date(session.year, 4, 19); // May 19
    }

    await prisma.session.update({
      where: { id: session.id },
      data: {
        trainingStartDate: startDate,
        trainingEndDate: endDate,
        referenceNumberFormat: '100 – KJM(FSKM 14/3/4/3)',
      },
    });
    sessionCount++;
  }
  console.log(`✅ Updated ${sessionCount} sessions with training dates and reference numbers`);

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total students updated: ${studentCount}`);
  console.log(`Total sessions updated: ${sessionCount}`);
  
  // Verify the updates
  const studentsWithIC = await prisma.user.count({
    where: {
      role: 'STUDENT',
      icNumber: { not: null },
    },
  });
  
  const sessionsWithDates = await prisma.session.count({
    where: {
      trainingStartDate: { not: null },
      trainingEndDate: { not: null },
    },
  });

  console.log('\n=== Verification ===');
  console.log(`Students with IC numbers: ${studentsWithIC}`);
  console.log(`Sessions with training dates: ${sessionsWithDates}`);
  console.log('\n✅ Production fields populated successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
