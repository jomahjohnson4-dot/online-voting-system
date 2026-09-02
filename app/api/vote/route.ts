import { NextResponse } from 'next/server';
import { votes, candidates, users } from '@/lib/db';
import { Vote } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support both payload structures: { userId, selections } OR { votes: [...] }
    let voterId = body.userId;
    let selections: Record<string, string> = body.selections || {};
    const electionId = String(body.electionId || 'el_1');

    // Normalize payload if coming as an array of votes from client
    if (Array.isArray(body.votes) && body.votes.length > 0) {
      voterId = body.votes[0].studentId || body.votes[0].userId;
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

    const cleanVoterId = String(voterId);

    // 2. Ensure voter account exists (with fallback auto-registration for dev sessions)
    let user = users.find((u) => String(u.id) === cleanVoterId);
    if (!user) {
      user = {
        id: cleanVoterId,
        name: body.userName || 'Student Voter',
        registrationNumber: cleanVoterId,
        role: 'STUDENT',
      } as (typeof users)[0];
      users.push(user);
    }

    // 3. Double-submission guard per election (using string coercion)
    const hasVotedInElection = votes.some(
      (v) => String(v.voterId) === cleanVoterId && String(v.electionId) === electionId
    );

    if (hasVotedInElection) {
      return NextResponse.json(
        { error: 'You have already cast your vote in this election.' },
        { status: 400 }
      );
    }

    // 4. Record vote entries and sync candidate vote counts
    const currentTimestamp = new Date().toISOString();

    Object.entries(selections).forEach(([positionId, candidateId]) => {
      const selectedPosId = String(positionId);
      const selectedCandId = String(candidateId);

      const newVote: Vote = {
        id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        voterId: cleanVoterId,
        electionId: electionId,
        positionId: selectedPosId,
        candidateId: selectedCandId,
        timestamp: currentTimestamp,
      };

      votes.push(newVote);

      // Increment candidate vote count safely across string/number types
      const candidate = candidates.find((c) => String(c.id) === selectedCandId) as
        | (typeof candidates[0] & { votes?: number })
        | undefined;

      if (candidate) {
        candidate.votes = (candidate.votes || 0) + 1;
      }
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