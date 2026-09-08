import { NextResponse } from 'next/server';
import { candidates, Candidate, getUniqueCandidates } from '@/lib/db';

// GET: Fetch all active candidates deduplicated (used by Admin & Student Ballot)
export async function GET() {
  const uniqueCandidates = getUniqueCandidates(candidates);
  return NextResponse.json({ candidates: uniqueCandidates }, { status: 200 });
}

// POST: Submit a new candidacy request
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

    // Check if candidate application already exists for this registration & position
    const candidatePosition = positionId || 'pos_1';
    const regNum = registrationNumber || name;

    const existingIndex = candidates.findIndex(
      (c) =>
        (c.registrationNumber || c.name).toLowerCase() === regNum.toLowerCase() &&
        (c.positionId || c.position) === candidatePosition
    );

    const newCandidate: Candidate = {
      id: existingIndex !== -1 ? candidates[existingIndex].id : `c_${Date.now()}`,
      electionId: 'el_1',
      positionId: candidatePosition,
      name,
      manifesto,
      status: 'Pending',
      registrationNumber,
      photoUrl,
    };

    if (existingIndex !== -1) {
      // Update existing record rather than pushing a duplicate
      candidates[existingIndex] = { ...candidates[existingIndex], ...newCandidate };
    } else {
      candidates.push(newCandidate);
    }

    return NextResponse.json(
      { message: 'Candidate request submitted successfully', candidate: newCandidate },
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

    // Locate candidate in in-memory list
    const candidateIndex = candidates.findIndex((c) => c.id === id);

    if (candidateIndex !== -1) {
      candidates[candidateIndex].status = status;
    } else {
      return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { message: `Candidate status updated to ${status}`, id, status },
      { status: 200 }
    );
  } catch (error) {
    console.error('Candidate status update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}