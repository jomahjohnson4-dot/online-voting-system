export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  registrationNumber: string;
  name: string;
  role: Role;
  collegeId?: string;    // e.g., 'COICT', 'COSTE'
  departmentId?: string; // e.g., 'CSE', 'ETE'
  courseId?: string;     // e.g., 'BIT', 'CS'
  yearOfStudy?: number;  // e.g., 1, 2, 3, 4
}

export interface Election {
  id: string;
  title: string;
  isOpen: boolean;
  startDate: string;
  endDate: string;
}

export interface Position {
  id: string;
  electionId: string;
  name: string; // e.g., "President", "Vice President", "Course Representative (Wabunge wa Course)"
}

export interface Candidate {
  id: string;
  name: string;
  positionId: string;
  electionId: string;
  manifesto?: string;
  collegeId?: string;    // Scoping for department/college reps
  departmentId?: string; // Scoping for department reps
  courseId?: string;     // Scoping for course reps
  yearOfStudy?: number;  // Scoping for class/year reps
}

export interface Vote {
  id: string;
  voterId: string;
  candidateId: string;
  positionId: string;
  electionId: string;
  timestamp: string;
}