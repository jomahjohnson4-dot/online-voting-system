import { NextResponse } from 'next/server';
import { positions as dbPositions, candidates as dbCandidates } from '@/lib/db';

export async function GET() {
  const formattedPositions = dbPositions.map((pos) => {
    // Cast pos to include optional candidates for safety checks
    const currentPos = pos as typeof pos & { candidates?: typeof dbCandidates };

    const matchingCandidates = Array.isArray(dbCandidates)
      ? dbCandidates.filter((c) => c.positionId === pos.id)
      : [];

    return {
      ...pos,
      candidates:
        Array.isArray(currentPos.candidates) && currentPos.candidates.length > 0
          ? currentPos.candidates
          : matchingCandidates,
    };
  });

  return NextResponse.json(formattedPositions, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Position name is required' }, { status: 400 });
    }

    const newPosition = {
      id: `pos_${Date.now()}`,
      electionId: body.electionId || 'el_1',
      name: body.name.trim(),
      candidates: [],
    };

    dbPositions.push(newPosition);
    return NextResponse.json(newPosition, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 500 });
  }
}