import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Positions
  const positionsData = [
    { id: 'pos_1', electionId: 'el_1', name: 'President' },
    { id: 'pos_2', electionId: 'el_1', name: 'Vice President' },
    { id: 'pos_3', electionId: 'el_1', name: 'Course Representative (Mbunge wa Course)' },
    { id: 'pos_4', electionId: 'el_1', name: 'Department Representative (Mbunge wa Department)' },
  ];

  for (const pos of positionsData) {
    await prisma.position.upsert({
      where: { id: pos.id },
      update: pos,
      create: pos,
    });
  }
  console.log('✅ Positions seeded');

  // 2. Seed 100 Students & 1 Admin
  const hundredStudents = Array.from({ length: 100 }, (_, index) => {
    const studentNum = String(index + 1).padStart(4, '0');
    return {
      id: `u_${index + 1}`,
      registrationNumber: `2510052914${studentNum}`,
      name: index === 27 ? 'Max Verstappen' : `Student ${index + 1}`,
      role: Role.STUDENT,
      collegeId: index % 2 === 0 ? 'COICT' : 'COSTE',
      departmentId: index % 2 === 0 ? 'CSE' : 'ETE',
      courseId: index % 2 === 0 ? 'BIT' : 'CS',
      yearOfStudy: (index % 3) + 1,
    };
  });

  for (const student of hundredStudents) {
    await prisma.user.upsert({
      where: { registrationNumber: student.registrationNumber },
      update: student,
      create: student,
    });
  }

  await prisma.user.upsert({
    where: { registrationNumber: 'ADMIN001' },
    update: {},
    create: {
      id: 'u_admin',
      registrationNumber: 'ADMIN001',
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Users (Students & Admin) seeded');

  // 3. Seed Candidates
  const candidatesData = [
    // President
    {
      id: 'c_1',
      electionId: 'el_1',
      positionId: 'pos_1',
      name: 'Emmanuel Joseph',
      registrationNumber: '25100529140001',
      manifesto: 'Enhancing student welfare, campus Wi-Fi, and digital access across campus.',
      status: 'Approved',
    },
    {
      id: 'c_2',
      electionId: 'el_1',
      positionId: 'pos_1',
      name: 'Grace Michael',
      registrationNumber: '25100529140002',
      manifesto: 'Accountable governance, transparent budgeting, and academic reform.',
      status: 'Approved',
    },
    {
      id: 'c_3',
      electionId: 'el_1',
      positionId: 'pos_1',
      name: 'Mercy Emmanuel',
      registrationNumber: '25100529140076',
      manifesto: 'Improving cafeteria standards, hostel welfare, and campus security.',
      status: 'Pending',
    },
    // Vice President
    {
      id: 'c_4',
      electionId: 'el_1',
      positionId: 'pos_2',
      name: 'Sarah John',
      registrationNumber: '25100529140004',
      manifesto: 'Promoting student health services and extracurricular engagement.',
      status: 'Approved',
    },
    {
      id: 'c_5',
      electionId: 'el_1',
      positionId: 'pos_2',
      name: 'Kelvin Peter',
      registrationNumber: '25100529140005',
      manifesto: 'Improving library resources and student hostel facilities.',
      status: 'Pending',
    },
    // Course Representative
    {
      id: 'c_6',
      electionId: 'el_1',
      positionId: 'pos_3',
      name: 'Brian Frank',
      registrationNumber: '25100529140006',
      manifesto: 'Advocating for timetable adjustments and lab equipment availability.',
      status: 'Approved',
    },
    {
      id: 'c_7',
      electionId: 'el_1',
      positionId: 'pos_3',
      name: 'Doreen Charles',
      registrationNumber: '25100529140007',
      manifesto: 'Strengthening study group coordination and lecture material access.',
      status: 'Pending',
    },
    {
      id: 'c_10',
      electionId: 'el_1',
      positionId: 'pos_3',
      name: 'Moses Peter',
      registrationNumber: '25100529140010',
      manifesto: 'Enhancing programming lab access for 1st year CS students.',
      status: 'Approved',
    },
    // Department Representative
    {
      id: 'c_8',
      electionId: 'el_1',
      positionId: 'pos_4',
      name: 'Jackson Robert',
      registrationNumber: '25100529140008',
      manifesto: 'Bridge between department faculty and students for fair grading reviews.',
      status: 'Approved',
    },
    {
      id: 'c_9',
      electionId: 'el_1',
      positionId: 'pos_4',
      name: 'Hellen Alex',
      registrationNumber: '25100529140009',
      manifesto: 'Organizing technical workshops, career fairs, and industry visits.',
      status: 'Pending',
    },
    {
      id: 'c_11',
      electionId: 'el_1',
      positionId: 'pos_4',
      name: 'Victor James',
      registrationNumber: '25100529140011',
      manifesto: 'Upgrading telecommunication hardware kits and lab components.',
      status: 'Pending',
    },
  ];

  for (const cand of candidatesData) {
    await prisma.candidate.upsert({
      where: { id: cand.id },
      update: cand,
      create: cand,
    });
  }
  console.log('✅ Candidates seeded');

  console.log('🚀 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });