export interface User {
  id: string;
  registrationNumber: string;
  name: string;
  phone?: string;
  role: 'STUDENT' | 'ADMIN';
  collegeId?: string;
  departmentId?: string;
  courseId?: string;
  yearOfStudy?: number;
}

export interface Position {
  id: string;
  electionId: string;
  name: string;
}

export interface Candidate {
  id: string;
  electionId: string;
  positionId: string;
  name: string;
  manifesto: string;
  registrationNumber?: string;
  photoUrl?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | string;
  position?: string;
  positionName?: string;
  collegeId?: string;
  departmentId?: string;
  courseId?: string;
  yearOfStudy?: number;
}

export interface Vote {
  id: string;
  electionId: string;
  userId: string;
  candidateId: string;
  positionId: string;
  createdAt: string;
}

// Global state bindings to preserve memory state across Next.js reloads
declare global {
  var __db_users: User[] | undefined;
  var __db_positions: Position[] | undefined;
  var __db_candidates: Candidate[] | undefined;
  var __db_votes: Vote[] | undefined;
}

// Generate 100 student voter accounts
const hundredStudents: User[] = Array.from({ length: 100 }, (_, index) => {
  const studentNum = String(index + 1).padStart(4, '0');
  const regNum = `2510052914${studentNum}`;

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

    // Vice President Candidates
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

    // Course Representative Candidates
    {
      id: 'c_6',
      electionId: 'el_1',
      positionId: 'pos_3',
      name: 'Brian Frank',
      registrationNumber: '25100529140006',
      manifesto: 'Advocating for timetable adjustments and lab equipment availability.',
      status: 'Approved',
      collegeId: 'COICT',
      courseId: 'BIT',
      yearOfStudy: 2,
    },
    {
      id: 'c_7',
      electionId: 'el_1',
      positionId: 'pos_3',
      name: 'Doreen Charles',
      registrationNumber: '25100529140007',
      manifesto: 'Strengthening study group coordination and lecture material access.',
      status: 'Pending',
      collegeId: 'COICT',
      courseId: 'BIT',
      yearOfStudy: 2,
    },
    {
      id: 'c_10',
      electionId: 'el_1',
      positionId: 'pos_3',
      name: 'Moses Peter',
      registrationNumber: '25100529140010',
      manifesto: 'Enhancing programming lab access for 1st year CS students.',
      status: 'Approved',
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
      registrationNumber: '25100529140008',
      manifesto: 'Bridge between department faculty and students for fair grading reviews.',
      status: 'Approved',
      collegeId: 'COICT',
      departmentId: 'CSE',
    },
    {
      id: 'c_9',
      electionId: 'el_1',
      positionId: 'pos_4',
      name: 'Hellen Alex',
      registrationNumber: '25100529140009',
      manifesto: 'Organizing technical workshops, career fairs, and industry visits.',
      status: 'Pending',
      collegeId: 'COICT',
      departmentId: 'CSE',
    },
    {
      id: 'c_11',
      electionId: 'el_1',
      positionId: 'pos_4',
      name: 'Victor James',
      registrationNumber: '25100529140011',
      manifesto: 'Upgrading telecommunication hardware kits and lab components.',
      status: 'Pending',
      collegeId: 'COSTE',
      departmentId: 'ETE',
    },
  ]);

export const votes: Vote[] =
  globalThis.__db_votes || (globalThis.__db_votes = []);

/**
 * Deduplication helper function to remove duplicate candidate entries
 * based on student Registration Number and targeted Position ID.
 */
export function getUniqueCandidates(list: Candidate[]): Candidate[] {
  const map = new Map<string, Candidate>();

  list.forEach((cand) => {
    const reg = cand.registrationNumber || cand.name;
    const pos = cand.positionId || cand.position || cand.positionName || 'default';
    const uniqueKey = `${reg}_${pos}`.toLowerCase().trim();

    if (!map.has(uniqueKey)) {
      map.set(uniqueKey, cand);
    } else {
      const existing = map.get(uniqueKey)!;
      map.set(uniqueKey, {
        ...existing,
        ...cand,
        photoUrl: cand.photoUrl || existing.photoUrl,
        status: cand.status || existing.status || 'Pending',
      });
    }
  });

  return Array.from(map.values());
}