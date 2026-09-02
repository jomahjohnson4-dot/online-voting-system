import { User, Position, Candidate, Vote } from './types';

export const users: User[] = [
  {
    id: 'u_1',
    registrationNumber: 'S0195/0028/2024',
    name: 'Max Verstapepen',
    role: 'STUDENT',
    collegeId: 'COICT',
    departmentId: 'CSE',
    courseId: 'BIT',
    yearOfStudy: 2,
  },
  {
    id: 'u_2',
    registrationNumber: 'S0198/0024/2024',
    name: 'Amina Salum',
    role: 'STUDENT',
    collegeId: 'COSTE',
    departmentId: 'ETE',
    courseId: 'CS',
    yearOfStudy: 1,
  },
  {
    id: 'u_admin',
    registrationNumber: 'ADMIN001',
    name: 'System Admin',
    role: 'ADMIN',
  },
];

export const positions: Position[] = [
  { id: 'pos_1', electionId: 'el_1', name: 'President' },
  { id: 'pos_2', electionId: 'el_1', name: 'Vice President' },
  { id: 'pos_3', electionId: 'el_1', name: 'Course Representative (Mbunge wa Course)' },
  { id: 'pos_4', electionId: 'el_1', name: 'Department Representative (Mbunge wa Department)' },
];

export const candidates: Candidate[] = [
  // -------------------------------------------------------------
  // University-Wide Candidates (Applies to all students)
  // -------------------------------------------------------------
  
  // President Candidates (3 Candidates)
  {
    id: 'c_1',
    electionId: 'el_1',
    positionId: 'pos_1',
    name: 'Emmanuel Joseph',
    manifesto: 'Enhancing student welfare, campus Wi-Fi, and digital access across campus.',
  },
  {
    id: 'c_2',
    electionId: 'el_1',
    positionId: 'pos_1',
    name: 'Grace Michael',
    manifesto: 'Accountable governance, transparent budgeting, and academic reform.',
  },
  {
    id: 'c_3',
    electionId: 'el_1',
    positionId: 'pos_1',
    name: 'Therapist Jomah',
    manifesto: 'Improving cafeteria standards, hostel welfare, and campus security.',
  },

  // Vice President Candidates
  {
    id: 'c_4',
    electionId: 'el_1',
    positionId: 'pos_2',
    name: 'Sarah John',
    manifesto: 'Promoting student health services and extracurricular engagement.',
  },
  {
    id: 'c_5',
    electionId: 'el_1',
    positionId: 'pos_2',
    name: 'Kelvin Peter',
    manifesto: 'Improving library resources and student hostel facilities.',
  },

  // -------------------------------------------------------------
  // Course Representative Candidates (Scoped by Course & Year)
  // -------------------------------------------------------------
  
  // Scoped to COICT - BIT Year 2
  {
    id: 'c_6',
    electionId: 'el_1',
    positionId: 'pos_3',
    name: 'Brian Frank',
    manifesto: 'Advocating for timetable adjustments and lab equipment availability.',
    collegeId: 'COICT',
    courseId: 'BIT',
    yearOfStudy: 2,
  },
  {
    id: 'c_7',
    electionId: 'el_1',
    positionId: 'pos_3',
    name: 'Doreen Charles',
    manifesto: 'Strengthening study group coordination and lecture material access.',
    collegeId: 'COICT',
    courseId: 'BIT',
    yearOfStudy: 2,
  },

  // Scoped to COICT - Computer Science (CS) Year 1
  {
    id: 'c_10',
    electionId: 'el_1',
    positionId: 'pos_3',
    name: 'Moses Peter',
    manifesto: 'Enhancing programming lab access for 1st year CS students.',
    collegeId: 'COICT',
    courseId: 'CS',
    yearOfStudy: 1,
  },

  // -------------------------------------------------------------
  // Department Representative Candidates (Scoped by Department)
  // -------------------------------------------------------------
  
  // Scoped to COICT - Computer Science & Engineering (CSE) Department
  {
    id: 'c_8',
    electionId: 'el_1',
    positionId: 'pos_4',
    name: 'Jackson Robert',
    manifesto: 'Bridge between department faculty and students for fair grading reviews.',
    collegeId: 'COICT',
    departmentId: 'CSE',
  },
  {
    id: 'c_9',
    electionId: 'el_1',
    positionId: 'pos_4',
    name: 'Hellen Alex',
    manifesto: 'Organizing technical workshops, career fairs, and industry visits.',
    collegeId: 'COICT',
    departmentId: 'CSE',
  },

  // Scoped to COSTE - Telecommunications (ETE) Department
  {
    id: 'c_11',
    electionId: 'el_1',
    positionId: 'pos_4',
    name: 'Victor James',
    manifesto: 'Upgrading telecommunication hardware kits and lab components.',
    collegeId: 'COSTE',
    departmentId: 'ETE',
  },
];

export const votes: Vote[] = [];