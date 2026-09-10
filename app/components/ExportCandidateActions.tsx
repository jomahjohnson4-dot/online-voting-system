'use client';

import React from 'react';

interface Candidate {
  id?: string;
  name?: string;
  fullName?: string;
  registrationNumber?: string;
  positionName?: string;
  position?: string;
  status?: string;
  manifesto?: string;
}

interface ExportCandidateActionsProps {
  candidates?: Candidate[];
}

export default function ExportCandidateActions({ candidates = [] }: ExportCandidateActionsProps) {
  // Handle CSV Download
  const handleExportCSV = () => {
    if (!candidates || candidates.length === 0) {
      alert('No candidate data available to export.');
      return;
    }

    const headers = ['Applicant Name', 'Registration Number', 'Position', 'Status', 'Manifesto'];
    const rows = candidates.map((c) => [
      `"${c.name || c.fullName || 'Unknown'}"`,
      `"${c.registrationNumber || 'N/A'}"`,
      `"${c.positionName || c.position || 'N/A'}"`,
      `"${c.status || 'Pending'}"`,
      `"${(c.manifesto || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Candidate_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle PDF Export Route/Trigger
  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/admin/export-pdf');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Candidate_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // Fallback print view if PDF route isn't generating binary blob directly
        window.print();
      }
    } catch (err) {
      console.warn('Backend PDF endpoint error, triggering print mode instead:', err);
      window.print();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportCSV}
        type="button"
        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5"
      >
        <span>📊</span> Export CSV
      </button>
      <button
        onClick={handleExportPDF}
        type="button"
        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5"
      >
        <span>📄</span> Download PDF
      </button>
    </div>
  );
}