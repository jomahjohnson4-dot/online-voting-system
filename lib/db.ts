import { User, Position, Candidate, Vote } from './types';

// Declare global types to keep database state alive across Next.js API reloads
declare global {
  var __db_users: User[] | undefined;
  var __db_positions: Position[] | undefined;
  var __db_candidates: Candidate[] | undefined;
  var __db_votes: Vote[] | undefined;
}

// Generate 100 student voter accounts using the University Registration Number format (e.g., 25100529140001)
const hundredStudents: User[] = Array.from({ length: 100 }, (_, index) => {
  const studentNum = String(index + 1).padStart(4, '0');
  const regNum = `2510052914${studentNum}`; // University registration format

  return {
    id: `u_${index + 1}`,
    registrationNumber: regNum,
    name: index === 27 ? 'Max Verstappen' : `Student ${index + 1}`,
    role: 'STUDENT',
    collegeId: index % 2 === 0 ? 'COICT' : 'COSTE',
    departmentId: index % 2 === 0 ? 'CSE' : 'ETE',
    courseId: index % 2 === 0 ? 'BIT' : 'CS',
    yearOfStudy: (index % 3) + 1,
  };
});

export const users: User[] =
  globalThis.__db_users ||
  (globalThis.__db_users = [
    ...hundredStudents,
    {
      id: 'u_admin',
      registrationNumber: 'ADMIN001',
      name: 'System Admin',
      role: 'ADMIN',
    },
  ]);

export const positions: Position[] =
  globalThis.__db_positions ||
  (globalThis.__db_positions = [
    { id: 'pos_1', electionId: 'el_1', name: 'President' },
    { id: 'pos_2', electionId: 'el_1', name: 'Vice President' },
    { id: 'pos_3', electionId: 'el_1', name: 'Course Representative (Mbunge wa Course)' },
    { id: 'pos_4', electionId: 'el_1', name: 'Department Representative (Mbunge wa Department)' },
  ]);

export const candidates: Candidate[] =
  globalThis.__db_candidates ||
  (globalThis.__db_candidates = [
    // President Candidates
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
      name: 'Mercy Emmanuel',
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

    // Course Representative Candidates
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

    // Department Representative Candidates
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
    {
      id: 'c_11',
      electionId: 'el_1',
      positionId: 'pos_4',
      name: 'Victor James',
      manifesto: 'Upgrading telecommunication hardware kits and lab components.',
      collegeId: 'COSTE',
      departmentId: 'ETE',
    },
  ]);

export const votes: Vote[] =
  globalThis.__db_votes || (globalThis.__db_votes = []);