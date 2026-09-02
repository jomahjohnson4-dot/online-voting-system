import { NextResponse } from 'next/server';
import { votes } from '@/lib/db';
import { Vote } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, selections, electionId = 'el_1' } = body;

    // Validate payload completeness and non-empty selection values
    if (
      !userId ||
      !selections ||
      typeof selections !== 'object' ||
      Object.keys(selections).length === 0 ||
      Object.values(selections).some((val) => !val)
    ) {
      return NextResponse.json(
        { error: 'Invalid submission. Please select candidates for all required positions.' },
        { status: 400 }
      );
    }

    // Check if user has already voted in this specific election
    const hasVotedInElection = votes.some(
      (v) => v.voterId === userId && v.electionId === electionId
    );

    if (hasVotedInElection) {
      return NextResponse.json(
        { error: 'You have already cast your vote in this election.' },
        { status: 400 }
      );
    }

    // Record vote entries for each selected position
    const currentTimestamp = new Date().toISOString();

    Object.entries(selections).forEach(([positionId, candidateId]) => {
      const newVote: Vote = {
        id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        voterId: String(userId),
        electionId: String(electionId),
        positionId: String(positionId),
        candidateId: String(candidateId),
        timestamp: currentTimestamp,
      };

      votes.push(newVote);
    });

    return NextResponse.json(
      { message: 'Vote submitted successfully!' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to record vote. Please try again.' },
      { status: 500 }
    );
  }
}