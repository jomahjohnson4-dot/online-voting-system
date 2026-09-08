import { NextResponse } from 'next/server';
import { positions, candidates, votes } from '@/lib/db';

export async function GET() {
  try {
    const currentVotes = votes || [];
    const currentPositions = positions || [];
    const currentCandidates = candidates || [];

    const results = currentPositions.map((position) => {
      // String coercion to prevent ID type mismatches (e.g., string vs number)
      const positionVotes = currentVotes.filter(
        (v) => String(v.positionId) === String(position.id)
      );
      const totalVotesCast = positionVotes.length;

      // Calculate candidate standings
      const candidatesWithVotes = currentCandidates
        .filter((c) => String(c.positionId) === String(position.id))
        .map((candidate) => {
          const voteCount = positionVotes.filter(
            (v) => String(v.candidateId) === String(candidate.id)
          ).length;

          const percentage =
            totalVotesCast > 0
              ? Number(((voteCount / totalVotesCast) * 100).toFixed(1))
              : 0;

          return {
            id: candidate.id,
            name: candidate.name,
            manifesto: candidate.manifesto,
            votes: voteCount,
            voteCount,
            percentage,
          };
        })
        .sort((a, b) => b.voteCount - a.voteCount);

      return {
        id: position.id,
        positionId: position.id,
        name: position.name,
        positionName: position.name,
        totalVotesCast,
        candidates: candidatesWithVotes,
      };
    });

    // Compute unique voters who have submitted ballots
    const uniqueVoterIds = new Set(
      currentVotes.map((v) => String(v.voterId || (v as unknown as { userId?: string }).userId))
    );

    return NextResponse.json(
      {
        totalVotes: currentVotes.length,
        totalBallots: uniqueVoterIds.size,
        positions: results,
        results, // Fallback alias
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching election results:', error);
    return NextResponse.json(
      { error: 'Failed to calculate election results.' },
      { status: 500 }
    );
  }
}