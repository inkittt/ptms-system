import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create 3 Coordinators
  const coordinators = [
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      role: UserRole.COORDINATOR,
      phone: '+60123456789',
      program: 'Computer Science',
    },
    {
      name: 'Prof. Ahmad Rahman',
      email: 'ahmad.rahman@university.edu',
      role: UserRole.COORDINATOR,
      phone: '+60123456790',
      program: 'Software Engineering',
    },
    {
      name: 'Dr. Emily Chen',
      email: 'emily.chen@university.edu',
      role: UserRole.COORDINATOR,
      phone: '+60123456791',
      program: 'Information Technology',
    },
  ];

  console.log('Creating coordinators...');
  const createdCoordinators = [];
  for (const coordinator of coordinators) {
    const user = await prisma.user.upsert({
      where: { email: coordinator.email },
      update: {},
      create: {
        ...coordinator,
        password: hashedPassword,
        pdpaConsent: true,
        tosAccepted: true,
      },
    });
    createdCoordinators.push(user);
  }

  // Create 30 Students from 3 classes (10 students per class)
  const students = [
    // Class 1: CS255 - Computer Science
    { name: 'Alice Tan Wei Ling', matricNo: '2021234501', program: 'CS255', creditsEarned: 120 },
    { name: 'Benjamin Lim Khai Ming', matricNo: '2021234502', program: 'CS255', creditsEarned: 115 },
    { name: 'Catherine Wong Mei Yee', matricNo: '2021234503', program: 'CS255', creditsEarned: 118 },
    { name: 'Daniel Ng Zhi Hao', matricNo: '2021234504', program: 'CS255', creditsEarned: 113 },
    { name: 'Emma Lee Xin Yi', matricNo: '2021234505', program: 'CS255', creditsEarned: 125 },
    { name: 'Fariz Ahmad Bin Hassan', matricNo: '2021234506', program: 'CS255', creditsEarned: 110 },
    { name: 'Grace Koh Li Ting', matricNo: '2021234507', program: 'CS255', creditsEarned: 122 },
    { name: 'Henry Tan Jun Wei', matricNo: '2021234508', program: 'CS255', creditsEarned: 108 },
    { name: 'Isabella Chong Hui Min', matricNo: '2021234509', program: 'CS255', creditsEarned: 116 },
    { name: 'Jason Yap Wei Jie', matricNo: '2021234510', program: 'CS255', creditsEarned: 119 },

    // Class 2: SE243 - Software Engineering
    { name: 'Karen Liew Shu Ting', matricNo: '2021567801', program: 'SE243', creditsEarned: 117 },
    { name: 'Liam Ong Wei Lun', matricNo: '2021567802', program: 'SE243', creditsEarned: 114 },
    { name: 'Michelle Teo Hui Xin', matricNo: '2021567803', program: 'SE243', creditsEarned: 121 },
    { name: 'Nathan Goh Jun Hao', matricNo: '2021567804', program: 'SE243', creditsEarned: 112 },
    { name: 'Olivia Sim Yi Ling', matricNo: '2021567805', program: 'SE243', creditsEarned: 124 },
    { name: 'Peter Khoo Zhi Yang', matricNo: '2021567806', program: 'SE243', creditsEarned: 109 },
    { name: 'Quinn Tan Hui Ying', matricNo: '2021567807', program: 'SE243', creditsEarned: 123 },
    { name: 'Ryan Lim Wei Kang', matricNo: '2021567808', program: 'SE243', creditsEarned: 111 },
    { name: 'Sophia Ng Jia Wen', matricNo: '2021567809', program: 'SE243', creditsEarned: 118 },
    { name: 'Thomas Chua Jun Ming', matricNo: '2021567810', program: 'SE243', creditsEarned: 120 },

    // Class 3: IT226 - Information Technology
    { name: 'Uma Devi Binti Raj', matricNo: '2021890101', program: 'IT226', creditsEarned: 115 },
    { name: 'Victor Wong Kai Xiang', matricNo: '2021890102', program: 'IT226', creditsEarned: 119 },
    { name: 'Wendy Lim Hui Qi', matricNo: '2021890103', program: 'IT226', creditsEarned: 113 },
    { name: 'Xavier Tan Wei Jian', matricNo: '2021890104', program: 'IT226', creditsEarned: 126 },
    { name: 'Yasmin Binti Abdullah', matricNo: '2021890105', program: 'IT226', creditsEarned: 110 },
    { name: 'Zachary Ng Jun Kai', matricNo: '2021890106', program: 'IT226', creditsEarned: 122 },
    { name: 'Amelia Koh Xin Hui', matricNo: '2021890107', program: 'IT226', creditsEarned: 107 },
    { name: 'Brandon Lee Wei Hao', matricNo: '2021890108', program: 'IT226', creditsEarned: 117 },
    { name: 'Chloe Tan Li Xuan', matricNo: '2021890109', program: 'IT226', creditsEarned: 121 },
    { name: 'David Ong Jun Heng', matricNo: '2021890110', program: 'IT226', creditsEarned: 114 },
  ];

  console.log('Creating students...');
  const createdStudents = [];
  for (const student of students) {
    const email = `${student.matricNo}@student.uitm.edu.my`;
    const user = await prisma.user.create({
      data: {
        name: student.name,
        email,
        password: hashedPassword,
        role: UserRole.STUDENT,
        matricNo: student.matricNo,
        program: student.program,
        phone: `+6012${Math.floor(1000000 + Math.random() * 9000000)}`,
        creditsEarned: student.creditsEarned,
        pdpaConsent: true,
        tosAccepted: true,
      },
    });

    // Create eligibility record with credits earned
    await prisma.eligibility.create({
      data: {
        userId: user.id,
        creditsEarned: student.creditsEarned,
        isEligible: student.creditsEarned >= 113,
        source: 'seed',
      },
    });

    createdStudents.push(user);
  }

  // Create a session for the students
  const session = await prisma.session.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Semester 1 2024/2025',
      year: 2024,
      semester: 1,
      minCredits: 113,
      minWeeks: 14,
      maxWeeks: 26,
      isActive: true,
      coordinatorId: createdCoordinators[0].id,
      deadlinesJSON: {
        submission: '2024-12-31',
        review: '2025-01-15',
      },
    } as any,
  });

  // Create StudentSession records for each student
  console.log('Creating student sessions...');
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    const studentData = students[i];
    
    await prisma.studentSession.upsert({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId: student.id,
        },
      },
      update: {},
      create: {
        sessionId: session.id,
        userId: student.id,
        creditsEarned: studentData.creditsEarned,
        isEligible: studentData.creditsEarned >= 113,
        status: 'active',
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log(`Created ${coordinators.length} coordinators`);
  console.log(`Created ${students.length} students across 3 programs`);
  console.log(`Created 1 active session`);
  console.log(`Created ${students.length} student session records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
