'use client';

import { useState } from 'react';
import Papa from 'papaparse';

interface CSVStudentRow {
  registrationNumber: string;
  name: string;
  collegeId?: string;
  departmentId?: string;
  courseId?: string;
  yearOfStudy?: string | number;
}

export default function AdminCSVImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVStudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setErrorMessage('');
    setStatusMessage('');

    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setErrorMessage('Please select a valid .csv file.');
      return;
    }

    setFile(selectedFile);

    Papa.parse<CSVStudentRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data);
      },
      error: () => {
        setErrorMessage('Failed to parse CSV file format.');
      },
    });
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setErrorMessage('No student data found in the CSV file.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const res = await fetch('/api/admin/import-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedData }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload voter register.');
      }

      setStatusMessage(data.message);
      setFile(null);
      setParsedData([]);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorMessage(errorObj.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Voter Register CSV Import</h1>
          <p className="text-slate-400 mt-1">
            Upload student records to authorize voters for upcoming elections.
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />

          {errorMessage && (
            <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-800">
              {errorMessage}
            </p>
          )}

          {statusMessage && (
            <p className="text-sm text-emerald-400 bg-emerald-900/30 p-3 rounded-lg border border-emerald-800">
              {statusMessage}
            </p>
          )}

          {parsedData.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">
                  Parsed Records Preview: {parsedData.length} Students
                </span>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {loading ? 'Importing Register...' : 'Confirm & Import Register'}
                </button>
              </div>

              <div className="overflow-x-auto max-h-60 rounded-xl border border-slate-700">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 sticky top-0">
                    <tr>
                      <th className="p-3">Reg Number</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">College</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {parsedData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-750">
                        <td className="p-3 font-mono">{row.registrationNumber}</td>
                        <td className="p-3">{row.name}</td>
                        <td className="p-3">{row.collegeId || '-'}</td>
                        <td className="p-3">{row.departmentId || '-'}</td>
                        <td className="p-3">{row.courseId || '-'}</td>
                        <td className="p-3">{row.yearOfStudy || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}