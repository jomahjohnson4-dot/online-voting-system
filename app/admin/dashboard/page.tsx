'use client';

import { useSyncExternalStore, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ExportCandidateActions from '@/app/components/ExportCandidateActions';

interface UserSession {
  id: string;
  name: string;
  registrationNumber: string;
  role: string;
}

interface Student {
  id: string;
  name: string;
  registrationNumber: string;
}

interface CandidateResult {
  id: string;
  name: string;
  manifesto?: string;
  voteCount: number;
  percentage: number | string;
}

interface PositionResult {
  positionId: string;
  positionName: string;
  totalVotesCast: number;
  candidates: CandidateResult[];
}

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [ballotData, setBallotData] = useState<PositionResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [candidateApps, setCandidateApps] = useState<CandidacyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Announcement State
  const [announcement, setAnnouncement] = useState('');
  const [votingRules, setVotingRules] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Add Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentReg, setNewStudentReg] = useState('');

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Fetch election results from backend
  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/results');
      if (res.ok) {
        const payload = await res.json();
        const positionList: PositionResult[] = Array.isArray(payload)
          ? payload
          : payload.positions || payload.results || [];

        setBallotData(positionList);
      }
    } catch (err) {
      console.error('Failed to load election results:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch candidate requests and deduplicate records across API & LocalStorage
  const fetchCandidacyRequests = useCallback(async () => {
    try {
      let apiCandidates: CandidacyApplication[] = [];
      const res = await fetch('/api/candidates');
      if (res.ok) {
        const data = await res.json();
        apiCandidates = data.candidates || [];
      }

      // Load local storage submissions & status updates
      const localApps: CandidacyApplication[] = JSON.parse(
        localStorage.getItem('candidateApplications') || '[]'
      );

      // Composite key for merging duplicates across API and LocalStorage
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

      // Process API candidates, combining photos and local status updates
      apiCandidates.forEach((apiApp) => {
        const key = getAppKey(apiApp);
        const localApp = localMap.get(key);

        uniqueMap.set(key, {
          ...apiApp,
          photoUrl: apiApp.photoUrl || localApp?.photoUrl,
          status: localApp?.status || apiApp.status || 'Pending',
        });
      });

      // Include local-only submissions if missing from API
      localApps.forEach((localApp) => {
        const key = getAppKey(localApp);
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, localApp);
        }
      });

      setCandidateApps(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error('Failed to load candidacy requests:', err);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser: UserSession = JSON.parse(storedUser);

    if (parsedUser.role?.toUpperCase() !== 'ADMIN') {
      router.push('/student/dashboard');
      return;
    }

    Promise.resolve().then(() => {
      const savedAnn = localStorage.getItem('electionAnnouncement') || '';
      const savedRules = localStorage.getItem('electionRules') || '';
      const savedStudents = JSON.parse(localStorage.getItem('studentRegister') || '[]');

      setAnnouncement(savedAnn);
      setVotingRules(savedRules);
      setStudents(savedStudents);
      setCurrentUser(parsedUser);
      fetchResults();
      fetchCandidacyRequests();
    });

    const interval = setInterval(() => {
      fetchResults();
      fetchCandidacyRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, [isMounted, router, fetchResults, fetchCandidacyRequests]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('electionAnnouncement', announcement);
    localStorage.setItem('electionRules', votingRules);
    setStatusMessage('Election details and guidelines published successfully!');
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentReg) return;

    const newStudent: Student = {
      id: Date.now().toString(),
      name: newStudentName,
      registrationNumber: newStudentReg,
    };

    try {
      await fetch('/api/voters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName,
          registrationNumber: newStudentReg,
          role: 'STUDENT',
        }),
      });
    } catch (err) {
      console.warn('Backend API route offline, saving locally:', err);
    }

    const updatedList = [...students, newStudent];
    setStudents(updatedList);
    localStorage.setItem('studentRegister', JSON.stringify(updatedList));

    setNewStudentName('');
    setNewStudentReg('');
    setStatusMessage(`Student "${newStudentName}" registered successfully.`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleDeleteStudent = (id: string) => {
    const updatedList = students.filter((s) => s.id !== id);
    setStudents(updatedList);
    localStorage.setItem('studentRegister', JSON.stringify(updatedList));
  };

  const handleUpdateCandidacyStatus = async (appId: string, newStatus: 'Approved' | 'Rejected') => {
    const updatedApps = candidateApps.map((app) =>
      app.id === appId ? { ...app, status: newStatus } : app
    );
    setCandidateApps(updatedApps);

    localStorage.setItem('candidateApplications', JSON.stringify(updatedApps));

    try {
      await fetch('/api/candidates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
    } catch (err) {
      console.warn('Backend offline; status saved locally:', err);
    }

    setStatusMessage(`Candidate status updated to ${newStatus}.`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  if (!isMounted || loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-800">
        <p className="text-sm font-medium">Loading Control Center...</p>
      </main>
    );
  }

  const grandTotalVotes = ballotData.reduce((acc, pos) => acc + pos.totalVotesCast, 0);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Election Control Center</h1>
            <p className="text-sm text-slate-500 mt-1">
              Logged in as <span className="text-blue-600 font-semibold">{currentUser?.name}</span> ({currentUser?.registrationNumber})
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Download PDF & CSV Action Toolbar */}
            <ExportCandidateActions candidates={candidateApps} />

            <Link
              href="/admin/import"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              Import CSV
            </Link>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition border border-slate-300"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Quick Route Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/candidates"
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition flex justify-between items-center group"
          >
            <div>
              <span className="font-bold text-slate-800 group-hover:text-blue-600 transition">Manage Candidates Page &rarr;</span>
              <p className="text-xs text-slate-500">Dedicated view to review candidate profiles and application statuses.</p>
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-500 hover:shadow-md transition flex justify-between items-center group"
          >
            <div>
              <span className="font-bold text-slate-800 group-hover:text-emerald-600 transition">Applicant Reports Page &rarr;</span>
              <p className="text-xs text-slate-500">View election analytics and export candidate registry files.</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Reports</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex justify-between items-center">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className="text-xs text-slate-400 hover:text-slate-600">
              Dismiss
            </button>
          </div>
        )}

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Ballots Cast</span>
            <div className="text-3xl font-bold text-slate-900 mt-2">{grandTotalVotes}</div>
            <p className="text-xs text-slate-500 mt-1">Across all positions</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Positions</span>
            <div className="text-3xl font-bold text-slate-900 mt-2">{ballotData.length}</div>
            <p className="text-xs text-slate-500 mt-1">Universal & Scoped categories</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidacy Requests</span>
            <div className="text-3xl font-bold text-amber-600 mt-2">{candidateApps.length}</div>
            <p className="text-xs text-slate-500 mt-1">Submitted by students</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Status</span>
            <div className="text-3xl font-bold text-emerald-600 mt-2">Live</div>
            <p className="text-xs text-slate-500 mt-1">Real-time polling active</p>
          </div>
        </div>

        {/* Candidacy Requests Verification Section */}
        <section className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Candidacy Applications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Review, verify, and approve candidate applications submitted by students.</p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-mono">
              Pending Verification: {candidateApps.filter((a) => (a.status || 'Pending') === 'Pending').length}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Reg. Number</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Manifesto</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidateApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400 italic">
                      No candidacy applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  candidateApps.map((app, index) => {
                    const rowKey = app.id ? `${app.id}_${index}` : `cand_${index}_${app.registrationNumber || 'anon'}`;

                    return (
                      <tr key={rowKey} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-3">
                          {app.photoUrl ? (
                            <img src={app.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                              👤
                            </div>
                          )}
                          <span>{app.name || app.fullName || 'Unknown Student'}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">
                          {app.registrationNumber || 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 text-xs">
                          {app.positionName || app.position || 'President'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate" title={app.manifesto}>
                          {app.manifesto || 'No manifesto provided.'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                              app.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : app.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {app.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleUpdateCandidacyStatus(app.id, 'Approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateCandidacyStatus(app.id, 'Rejected')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg transition"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Announcement Broadcast Section */}
        <section className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Publish Election Announcements & Rules</h2>
          <form onSubmit={handlePublishAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Election Schedule & Date
              </label>
              <textarea
                rows={2}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="e.g. Voting opens Friday, Oct 24, 2026, from 08:00 AM to 05:00 PM."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Voting Rules & Student Instructions
              </label>
              <textarea
                rows={3}
                value={votingRules}
                onChange={(e) => setVotingRules(e.target.value)}
                placeholder="e.g. 1. Voting is strictly one attempt per student registration number."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              Broadcast Announcement
            </button>
          </form>
        </section>

        {/* Student Directory Management */}
        <section className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">Student Directory Management</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-mono">
              Total Registered: {students.length}
            </span>
          </div>

          <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Student Full Name"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Registration Number (e.g. S0195/0028/2024)"
              value={newStudentReg}
              onChange={(e) => setNewStudentReg(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              Add Student
            </button>
          </form>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Registration Number</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-400 italic">
                      No students found in directory.
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr key={student.id ? `${student.id}_${index}` : `student_${index}`} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">{student.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{student.registrationNumber}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-lg transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Live Standings View */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Live Position Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ballotData.map((position, posIdx) => (
              <div key={position.positionId || `pos_${posIdx}`} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-lg text-slate-800">{position.positionName}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-mono">
                    Total: {position.totalVotesCast} Votes
                  </span>
                </div>

                <div className="space-y-3">
                  {position.candidates.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No candidates registered for this position.</p>
                  ) : (
                    position.candidates.map((cand, idx) => {
                      const numPercentage = Number(cand.percentage);

                      return (
                        <div key={cand.id ? `${cand.id}_${idx}` : `c_${posIdx}_${idx}`} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700">{cand.name}</span>
                              {idx === 0 && cand.voteCount > 0 && (
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                                  LEAD
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                              {cand.voteCount} votes ({numPercentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0 ? 'bg-blue-600' : 'bg-slate-400'
                              }`}
                              style={{ width: `${numPercentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}