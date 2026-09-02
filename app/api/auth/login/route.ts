import { NextResponse } from 'next/server';
import { users } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.registrationNumber) {
      return NextResponse.json(
        { error: 'Registration number is required.' },
        { status: 400 }
      );
    }

    const regNo = body.registrationNumber.trim().toLowerCase();
    const user = users.find(
      (u) => u.registrationNumber.trim().toLowerCase() === regNo
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid registration number. Voter not registered.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Authentication successful', user },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}