// app/api/admin/export-candidates/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Fetch candidate applications (Replace with your database query or server store)
    // Example: const candidates = await db.candidate.findMany();
    
    // For demo/mock setup:
    const mockCandidates = [
      {
        id: 'app_1',
        name: 'Johnson John Nyarusanda',
        registrationNumber: '25100529140067',
        positionName: 'President',
        phoneNumber: '+255 700 000 000',
        status: 'Pending',
        createdAt: '2026-09-10T10:00:00.000Z',
      },
    ];

    // 2. Build CSV Headers & Rows
    const headers = ['Application ID', 'Full Name', 'Registration Number', 'Position', 'Phone Number', 'Status', 'Applied At'];
    
    const rows = mockCandidates.map((c) => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.registrationNumber}"`,
      `"${c.positionName.replace(/"/g, '""')}"`,
      `"${c.phoneNumber}"`,
      `"${c.status}"`,
      `"${new Date(c.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // 3. Return CSV Response with Attachment Headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="candidate_applications_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to generate export file.' }, { status: 500 });
  }
}