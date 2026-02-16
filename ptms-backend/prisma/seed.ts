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
      email: 'sarah.johnson@uitm.edu.my',
      role: UserRole.COORDINATOR,
      phone: '+60123456789',
      program: 'Computer Science',
      faculty: 'Fakulti Sains Komputer dan\nMatematik',
      campus: 'Kampus Jasin',
      campusAddress: '77300 Merlimau, Jasin',
      campusCity: 'Melaka Bandaraya Bersejarah',
      campusPhone: '(+606) 2645000',
      universityBranch: 'Universiti Teknologi MARA(Melaka)',
    },
    {
      name: 'Prof. Ahmad Rahman',
      email: 'ahmad.rahman@uitm.edu.my',
      role: UserRole.COORDINATOR,
      phone: '+60123456790',
      program: 'Software Engineering',
      faculty: 'Fakulti Sains Komputer dan\nMatematik',
      campus: 'Kampus Jasin',
      campusAddress: '77300 Merlimau, Jasin',
      campusCity: 'Melaka Bandaraya Bersejarah',
      campusPhone: '(+606) 2645000',
      universityBranch: 'Universiti Teknologi MARA(Melaka)',
    },
    {
      name: 'Dr. Emily Chen',
      email: 'emily.chen@uitm.edu.my',
      role: UserRole.COORDINATOR,
      phone: '+60123456791',
      program: 'Information Technology',
      faculty: 'Fakulti Sains Komputer dan\nMatematik',
      campus: 'Kampus Jasin',
      campusAddress: '77300 Merlimau, Jasin',
      campusCity: 'Melaka Bandaraya Bersejarah',
      campusPhone: '(+606) 2645000',
      universityBranch: 'Universiti Teknologi MARA(Melaka)',
    },
  ];

  console.log('Creating coordinators...');
  const createdCoordinators = [];
  for (const coordinator of coordinators) {
    const user = await prisma.user.upsert({
      where: { email: coordinator.email },
      update: {
        faculty: coordinator.faculty,
        campus: coordinator.campus,
        campusAddress: coordinator.campusAddress,
        campusCity: coordinator.campusCity,
        campusPhone: coordinator.campusPhone,
        universityBranch: coordinator.universityBranch,
      },
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
    { name: 'Alice Tan Wei Ling', matricNo: '2021234501', icNumber: '030215-10-5678', program: 'CS255', creditsEarned: 120 },
    { name: 'Benjamin Lim Khai Ming', matricNo: '2021234502', icNumber: '030428-14-3421', program: 'CS255', creditsEarned: 115 },
    { name: 'Catherine Wong Mei Yee', matricNo: '2021234503', icNumber: '030612-08-7654', program: 'CS255', creditsEarned: 118 },
    { name: 'Daniel Ng Zhi Hao', matricNo: '2021234504', icNumber: '030820-05-2341', program: 'CS255', creditsEarned: 113 },
    { name: 'Emma Lee Xin Yi', matricNo: '2021234505', icNumber: '031103-10-8765', program: 'CS255', creditsEarned: 125 },
    { name: 'Fariz Ahmad Bin Hassan', matricNo: '2021234506', icNumber: '030925-14-4532', program: 'CS255', creditsEarned: 110 },
    { name: 'Grace Koh Li Ting', matricNo: '2021234507', icNumber: '030507-08-6543', program: 'CS255', creditsEarned: 122 },
    { name: 'Henry Tan Jun Wei', matricNo: '2021234508', icNumber: '030718-05-3214', program: 'CS255', creditsEarned: 108 },
    { name: 'Isabella Chong Hui Min', matricNo: '2021234509', icNumber: '031230-10-7896', program: 'CS255', creditsEarned: 116 },
    { name: 'Jason Yap Wei Jie', matricNo: '2021234510', icNumber: '030401-14-5432', program: 'CS255', creditsEarned: 119 },

    // Class 2: SE243 - Software Engineering
    { name: 'Karen Liew Shu Ting', matricNo: '2021567801', icNumber: '030314-08-8901', program: 'SE243', creditsEarned: 117 },
    { name: 'Liam Ong Wei Lun', matricNo: '2021567802', icNumber: '030526-05-4567', program: 'SE243', creditsEarned: 114 },
    { name: 'Michelle Teo Hui Xin', matricNo: '2021567803', icNumber: '030809-10-6789', program: 'SE243', creditsEarned: 121 },
    { name: 'Nathan Goh Jun Hao', matricNo: '2021567804', icNumber: '031015-14-2345', program: 'SE243', creditsEarned: 112 },
    { name: 'Olivia Sim Yi Ling', matricNo: '2021567805', icNumber: '030122-08-9012', program: 'SE243', creditsEarned: 124 },
    { name: 'Peter Khoo Zhi Yang', matricNo: '2021567806', icNumber: '030607-05-5678', program: 'SE243', creditsEarned: 109 },
    { name: 'Quinn Tan Hui Ying', matricNo: '2021567807', icNumber: '030911-10-3456', program: 'SE243', creditsEarned: 123 },
    { name: 'Ryan Lim Wei Kang', matricNo: '2021567808', icNumber: '031128-14-7890', program: 'SE243', creditsEarned: 111 },
    { name: 'Sophia Ng Jia Wen', matricNo: '2021567809', icNumber: '030203-08-4321', program: 'SE243', creditsEarned: 118 },
    { name: 'Thomas Chua Jun Ming', matricNo: '2021567810', icNumber: '030419-05-8765', program: 'SE243', creditsEarned: 120 },

    // Class 3: IT226 - Information Technology
    { name: 'Uma Devi Binti Raj', matricNo: '2021890101', icNumber: '030705-10-6543', program: 'IT226', creditsEarned: 115 },
    { name: 'Victor Wong Kai Xiang', matricNo: '2021890102', icNumber: '030817-14-2109', program: 'IT226', creditsEarned: 119 },
    { name: 'Wendy Lim Hui Qi', matricNo: '2021890103', icNumber: '031024-08-5432', program: 'IT226', creditsEarned: 113 },
    { name: 'Xavier Tan Wei Jian', matricNo: '2021890104', icNumber: '030110-05-8901', program: 'IT226', creditsEarned: 126 },
    { name: 'Yasmin Binti Abdullah', matricNo: '2021890105', icNumber: '030622-10-3210', program: 'IT226', creditsEarned: 110 },
    { name: 'Zachary Ng Jun Kai', matricNo: '2021890106', icNumber: '030904-14-7654', program: 'IT226', creditsEarned: 122 },
    { name: 'Amelia Koh Xin Hui', matricNo: '2021890107', icNumber: '031216-08-4567', program: 'IT226', creditsEarned: 107 },
    { name: 'Brandon Lee Wei Hao', matricNo: '2021890108', icNumber: '030328-05-9876', program: 'IT226', creditsEarned: 117 },
    { name: 'Chloe Tan Li Xuan', matricNo: '2021890109', icNumber: '030510-10-2345', program: 'IT226', creditsEarned: 121 },
    { name: 'David Ong Jun Heng', matricNo: '2021890110', icNumber: '030723-14-6789', program: 'IT226', creditsEarned: 114 },
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
        icNumber: student.icNumber,
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
    update: {
      trainingStartDate: new Date('2024-09-15'),
      trainingEndDate: new Date('2024-12-19'),
      referenceNumberFormat: '100 – KJM(FSKM 14/3/4/3)',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Semester 1 2024/2025',
      year: 2024,
      semester: 1,
      trainingStartDate: new Date('2024-09-15'),
      trainingEndDate: new Date('2024-12-19'),
      minCredits: 113,
      minWeeks: 14,
      maxWeeks: 26,
      isActive: true,
      coordinatorId: createdCoordinators[0].id,
      referenceNumberFormat: '100 – KJM(FSKM 14/3/4/3)',
      deadlinesJSON: {
        submission: '2024-12-31',
        review: '2025-01-15',
        applicationDeadline: '2024-09-05',
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
