import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [dbPositions, dbCandidates, dbVotes] = await Promise.all([
      db.position.findMany({ orderBy: { id: 'asc' } }),
      db.candidate.findMany({ orderBy: { id: 'asc' } }),
      db.vote.findMany(),
    ]);

    const results = dbPositions.map((position) => {
      const positionVotes = dbVotes.filter(
        (v) => String(v.positionId) === String(position.id)
      );
      const totalVotesCast = positionVotes.length;

      const candidatesWithVotes = dbCandidates
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

    const uniqueVoterIds = new Set(dbVotes.map((v) => String(v.userId)));

    return NextResponse.json(
      {
        totalVotes: dbVotes.length,
        totalBallots: uniqueVoterIds.size,
        positions: results,
        results,
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