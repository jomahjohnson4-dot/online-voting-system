import { PrismaClient } from '@prisma/client';

// Type definitions for application models
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
  createdAt: string | Date;
}

// Singleton Prisma Client instance to prevent connection leaks during Next.js HMR
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

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