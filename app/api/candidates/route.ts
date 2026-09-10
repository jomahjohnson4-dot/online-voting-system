import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch all active candidates from PostgreSQL
export async function GET() {
  try {
    const candidates = await db.candidate.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ candidates }, { status: 200 });
  } catch (error) {
    console.error('Fetch candidates error:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}

// POST: Submit a new candidacy request or update existing application
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, manifesto, positionId, photoUrl, registrationNumber } = body;

    if (!name || !manifesto) {
      return NextResponse.json(
        { error: 'Name and manifesto are required fields.' },
        { status: 400 }
      );
    }

    const candidatePosition = positionId || 'pos_1';
    const regNum = registrationNumber || name;

    // Check if an application already exists for this registration & position
    const existingCandidate = await db.candidate.findFirst({
      where: {
        registrationNumber: regNum,
        positionId: candidatePosition,
      },
    });

    let candidate;

    if (existingCandidate) {
      // Update existing record
      candidate = await db.candidate.update({
        where: { id: existingCandidate.id },
        data: {
          name,
          manifesto,
          photoUrl: photoUrl || existingCandidate.photoUrl,
          status: 'Pending',
        },
      });
    } else {
      // Create new candidate record
      candidate = await db.candidate.create({
        data: {
          id: `c_${Date.now()}`,
          electionId: 'el_1',
          positionId: candidatePosition,
          name,
          manifesto,
          registrationNumber: regNum,
          photoUrl: photoUrl || null,
          status: 'Pending',
        },
      });
    }

    return NextResponse.json(
      { message: 'Candidate request submitted successfully', candidate },
      { status: 201 }
    );
  } catch (error) {
    console.error('Candidate submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update application status (Approved / Rejected) from Admin Dashboard
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Candidate ID and new status are required.' },
        { status: 400 }
      );
    }

    // Verify candidate existence
    const existingCandidate = await db.candidate.findUnique({
      where: { id },
    });

    if (!existingCandidate) {
      return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 });
    }

    // Update status in PostgreSQL
    const updatedCandidate = await db.candidate.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(
      {
        message: `Candidate status updated to ${status}`,
        candidate: updatedCandidate,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Candidate status update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}