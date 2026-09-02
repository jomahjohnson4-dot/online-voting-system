import { NextResponse } from 'next/server';
import { users } from '@/lib/db';
import { User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !Array.isArray(body.students)) {
      return NextResponse.json(
        { error: 'Invalid payload. Expected an array of student records.' },
        { status: 400 }
      );
    }

    const importedStudents: User[] = body.students;
    let addedCount = 0;

    importedStudents.forEach((student) => {
      if (!student.registrationNumber || !student.name) return;

      const normalizedReg = student.registrationNumber.trim().toUpperCase();

      const existingIndex = users.findIndex(
        (u) => u.registrationNumber.toUpperCase() === normalizedReg
      );

      const formattedUser: User = {
        id: existingIndex !== -1 ? users[existingIndex].id : `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        registrationNumber: normalizedReg,
        name: student.name.trim(),
        role: 'STUDENT',
        collegeId: student.collegeId?.trim() || undefined,
        departmentId: student.departmentId?.trim() || undefined,
        courseId: student.courseId?.trim() || undefined,
        yearOfStudy: student.yearOfStudy ? Number(student.yearOfStudy) : undefined,
      };

      if (existingIndex !== -1) {
        users[existingIndex] = formattedUser;
      } else {
        users.push(formattedUser);
        addedCount++;
      }
    });

    return NextResponse.json(
      {
        message: `Import completed successfully. Added ${addedCount} new students. Total register count: ${users.length}`,
        totalCount: users.length,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to process student import.' },
      { status: 500 }
    );
  }
}
