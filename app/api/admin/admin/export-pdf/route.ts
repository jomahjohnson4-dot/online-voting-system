// app/api/admin/export-pdf/route.ts
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function GET() {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));

  // Document Title
  doc.fontSize(18).text('Student Candidate Applications', { align: 'center' });
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);

  // Table Sample Content
  const sampleCandidates = [
    { name: 'Johnson John Nyarusanda', reg: '25100529140067', pos: 'President', status: 'Pending' },
  ];

  sampleCandidates.forEach((c, index) => {
    doc.fontSize(11).text(`${index + 1}. ${c.name} - ${c.pos} (${c.reg})`);
    doc.fontSize(9).fillColor('gray').text(`Status: ${c.status}`);
    doc.moveDown(1);
  });

  doc.end();

  await new Promise((resolve) => doc.on('end', resolve));
  const pdfData = Buffer.concat(buffers);

  return new NextResponse(pdfData, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="candidate_report.pdf"',
    },
  });
}