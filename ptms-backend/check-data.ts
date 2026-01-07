import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('Checking database data...\n');

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      name: true,
      email: true,
      matricNo: true,
      program: true,
      creditsEarned: true,
    },
    orderBy: { matricNo: 'asc' },
  });

  console.log(`Total students: ${students.length}\n`);

  students.forEach((student, index) => {
    console.log(`${index + 1}. ${student.name}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Matric: ${student.matricNo}`);
    console.log(`   Program: ${student.program}`);
    console.log(`   Credits: ${student.creditsEarned}`);
    console.log('');
  });

  const missingCredits = students.filter(s => !s.creditsEarned);
  const wrongEmailFormat = students.filter(s => !s.email.includes('@student.uitm.edu.my'));
  const wrongProgram = students.filter(s => !['CS255', 'SE243', 'IT226'].includes(s.program || ''));

  console.log('\n=== ISSUES FOUND ===');
  console.log(`Students missing credits: ${missingCredits.length}`);
  console.log(`Students with wrong email format: ${wrongEmailFormat.length}`);
  console.log(`Students with wrong program format: ${wrongProgram.length}`);

  if (missingCredits.length > 0) {
    console.log('\nStudents missing credits:');
    missingCredits.forEach(s => console.log(`  - ${s.name} (${s.matricNo})`));
  }

  if (wrongEmailFormat.length > 0) {
    console.log('\nStudents with wrong email:');
    wrongEmailFormat.forEach(s => console.log(`  - ${s.name}: ${s.email}`));
  }

  if (wrongProgram.length > 0) {
    console.log('\nStudents with wrong program:');
    wrongProgram.forEach(s => console.log(`  - ${s.name}: ${s.program}`));
  }
}

checkData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
