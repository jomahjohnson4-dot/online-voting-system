import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.registrationNumber) {
      return NextResponse.json(
        { error: 'Registration number is required.' },
        { status: 400 }
      );
    }

    const rawRegNo = String(body.registrationNumber).trim();
    const cleanRegNo = rawRegNo.toLowerCase();

    // 1. Query existing student record in PostgreSQL (case-insensitive)
    let user = await db.user.findFirst({
      where: {
        registrationNumber: {
          equals: rawRegNo,
          mode: 'insensitive',
        },
      },
    });

    // 2. Fallback auto-registration for valid university registration numbers
    const isUniversityReg = /^\d{10,15}$/.test(rawRegNo);

    if (!user && (isUniversityReg || rawRegNo.length >= 8)) {
      user = await db.user.create({
        data: {
          id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          registrationNumber: rawRegNo,
          name: `Student (${rawRegNo})`,
          role: 'STUDENT',
          collegeId: 'COICT',
          departmentId: 'CSE',
          courseId: 'BIT',
          yearOfStudy: 1,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid university registration number format.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Authentication successful', user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login processing error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}