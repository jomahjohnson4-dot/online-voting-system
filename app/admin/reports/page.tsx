'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ExportCandidateActions from '@/app/components/ExportCandidateActions';

interface CandidacyApplication {
  id: string;
  name?: string;
  fullName?: string;
  registrationNumber?: string;
  positionId?: string;
  positionName?: string;
  position?: string;
  manifesto?: string;
  photoUrl?: string;
  status: string;
}

export default function AdminReportsPage() {
  const [candidates, setCandidates] = useState<CandidacyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch candidate submissions across API & LocalStorage
  const fetchCandidates = useCallback(async () => {
    try {
      let apiCandidates: CandidacyApplication[] = [];
      const res = await fetch('/api/candidates');
      if (res.ok) {
        const data = await res.json();
        apiCandidates = data.candidates || [];
      }

      const localApps: CandidacyApplication[] = JSON.parse(
        localStorage.getItem('candidateApplications') || '[]'
      );

      const getAppKey = (app: CandidacyApplication) => {
        const reg = app.registrationNumber || '';
        const pos = app.positionName || app.position || '';
        const name = app.name || app.fullName || '';
        
        if (reg && reg !== 'N/A') return `${reg}_${pos}`.toLowerCase();
        if (app.id) return app.id;
        return `${name}_${pos}`.toLowerCase();
      };

      const localMap = new Map<string, CandidacyApplication>();
      localApps.forEach((app) => {
        localMap.set(getAppKey(app), app);
      });

      const uniqueMap = new Map<string, CandidacyApplication>();

      apiCandidates.forEach((apiApp) => {
        const key = getAppKey(apiApp);
        const localApp = localMap.get(key);

        uniqueMap.set(key, {
          ...apiApp,
          photoUrl: apiApp.photoUrl || localApp?.photoUrl,
          status: localApp?.status || apiApp.status || 'Pending',
        });
      });

      localApps.forEach((localApp) => {
        const key = getAppKey(localApp);
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, localApp);
        }
      });

      setCandidates(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error('Failed to load candidate reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchCandidates();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchCandidates]);

  const approvedCount = candidates.filter((c) => c.status === 'Approved').length;
  const pendingCount = candidates.filter((c) => (c.status || 'Pending') === 'Pending').length;
  const rejectedCount = candidates.filter((c) => c.status === 'Rejected').length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/admin/dashboard"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            &larr; Back to Control Center
          </Link>
        </div>

        {/* Top Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Applicant Reports</h1>
            <p className="text-xs text-slate-500 mt-1">
              Overview and export options for all student candidacy submissions.
            </p>
          </div>

          {/* Integrated Export Toolbar */}
          <ExportCandidateActions candidates={candidates} />
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applicants</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{candidates.length}</div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{approvedCount}</div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Rejected</span>
            <div className="text-2xl font-bold text-rose-700 mt-1">{rejectedCount}</div>
          </div>
        </div>

        {/* Candidate Data Table */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Submitted Applications Registry</h2>

          {loading ? (
            <p className="text-sm text-slate-500 italic py-4">Loading applicant dataset...</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Applicant Name</th>
                    <th className="px-4 py-3">Reg. Number</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">
                        No candidate applications recorded.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((cand, idx) => (
                      <tr key={cand.id ? `${cand.id}_${idx}` : `report_${idx}`} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {cand.name || cand.fullName || 'Unknown Student'}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">
                          {cand.registrationNumber || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                          {cand.positionName || cand.position || 'President'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                              cand.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : cand.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {cand.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}