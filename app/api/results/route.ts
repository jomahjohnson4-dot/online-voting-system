import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch positions along with candidates and total vote count in parallel
    const [positions, totalVotes, totalBallots] = await Promise.all([
      db.position.findMany({
        orderBy: { id: 'asc' },
        include: {
          candidates: {
            include: {
              _count: {
                select: { votes: true },
              },
            },
          },
          _count: {
            select: { votes: true },
          },
        },
      }),
      db.vote.count(),
      db.vote.groupBy({
        by: ['userId'],
      }),
    ]);

    // 2. Format results structure for client consumption
    const results = positions.map((position) => {
      const totalVotesCast = position._count.votes;

      const candidatesWithVotes = position.candidates
        .map((candidate) => {
          const voteCount = candidate._count.votes;
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

    return NextResponse.json(
      {
        totalVotes,
        totalBallots: totalBallots.length,
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