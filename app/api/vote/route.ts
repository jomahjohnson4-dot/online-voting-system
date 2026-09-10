import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    // Support both payload structures: { userId, selections } OR { votes: [...] }
    let voterId = body.userId || body.voterId;
    let selections: Record<string, string> = body.selections || {};
    const electionId = String(body.electionId || 'el_1');

    // Normalize payload if coming as an array of votes from client
    if (Array.isArray(body.votes) && body.votes.length > 0) {
      voterId = body.votes[0].studentId || body.votes[0].userId || body.votes[0].voterId;
      selections = {};
      body.votes.forEach((v: { positionId: string | number; candidateId: string | number }) => {
        if (v.positionId && v.candidateId) {
          selections[String(v.positionId)] = String(v.candidateId);
        }
      });
    }

    // 1. Validate payload completeness
    if (
      !voterId ||
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

    const cleanVoterId = String(voterId).trim();

    // 2. Fetch user or perform auto-registration in PostgreSQL
    let user = await db.user.findFirst({
      where: {
        OR: [
          { id: cleanVoterId },
          { registrationNumber: { equals: cleanVoterId, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          id: cleanVoterId.startsWith('u_') ? cleanVoterId : `u_${Date.now()}`,
          name: body.userName || `Student (${cleanVoterId})`,
          registrationNumber: cleanVoterId.toUpperCase(),
          role: 'STUDENT',
        },
      });
    }

    // 3. Check double-submission guard in PostgreSQL
    const existingVote = await db.vote.findFirst({
      where: {
        userId: user.id,
        electionId: electionId,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already cast your vote in this election.' },
        { status: 400 }
      );
    }

    // 4. Atomic transaction to create vote records in PostgreSQL
    const voteEntries = Object.entries(selections).map(([positionId, candidateId]) => ({
      id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      electionId: electionId,
      positionId: String(positionId),
      candidateId: String(candidateId),
    }));

    await db.$transaction(async (tx) => {
      // Create vote entries
      await tx.vote.createMany({
        data: voteEntries,
      });
    });

    return NextResponse.json(
      { message: 'Vote submitted successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing vote submission:', error);
    return NextResponse.json(
      { error: 'Failed to record vote. Please try again.' },
      { status: 500 }
    );
  }
}