import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch all positions from PostgreSQL along with their associated candidates
    const positions = await db.position.findMany({
      orderBy: { id: 'asc' },
      include: {
        candidates: true,
      },
    });

    return NextResponse.json(positions, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Position name is required' },
        { status: 400 }
      );
    }

    // Create a new position record in PostgreSQL
    const newPosition = await db.position.create({
      data: {
        id: `pos_${Date.now()}`,
        electionId: body.electionId || 'el_1',
        name: body.name.trim(),
      },
      include: {
        candidates: true,
      },
    });

    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 500 });
  }
}