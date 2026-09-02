import { NextResponse } from 'next/server';
import { positions, candidates } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const electionIdFilter = searchParams.get('electionId') || 'el_1';

    // Extract student scoping parameters from query parameters
    const collegeId = searchParams.get('collegeId');
    const departmentId = searchParams.get('departmentId');
    const courseId = searchParams.get('courseId');
    const yearOfStudy = searchParams.get('yearOfStudy')
      ? Number(searchParams.get('yearOfStudy'))
      : undefined;

    // Filter positions belonging to the active election
    const activePositions = positions.filter(
      (p) => p.electionId === electionIdFilter
    );

    // Construct scoped ballot structure matching eligible candidates
    const ballotData = activePositions.map((position) => {
      const positionCandidates = candidates.filter((c) => {
        // Ensure position and election ID match
        if (c.positionId !== position.id || c.electionId !== electionIdFilter) {
          return false;
        }

        // 1. University-wide positions (President, Vice President) apply to all students
        if (!c.collegeId && !c.departmentId && !c.courseId && !c.yearOfStudy) {
          return true;
        }

        // 2. Department Representative (Mbunge wa Department) matching
        if (c.departmentId && c.departmentId === departmentId) {
          return true;
        }

        // 3. Course Representative (Mbunge wa Course) matching (Course + Year)
        if (
          c.courseId &&
          c.courseId === courseId &&
          c.yearOfStudy === yearOfStudy
        ) {
          return true;
        }

        return false;
      });

      return {
        id: position.id,
        electionId: position.electionId,
        name: position.name,
        candidates: positionCandidates.map((cand) => ({
          id: cand.id,
          name: cand.name,
          manifesto: cand.manifesto,
        })),
      };
    });

    return NextResponse.json(ballotData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch candidate ballot data' },
      { status: 500 }
    );
  }
}