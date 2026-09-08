'use client';

import { useSyncExternalStore, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [ballotData, setBallotData] = useState<PositionResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
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

    // Schedule initial synchronous state updates asynchronously to eliminate Next.js/React hydration warnings
    Promise.resolve().then(() => {
      const savedAnn = localStorage.getItem('electionAnnouncement') || '';
      const savedRules = localStorage.getItem('electionRules') || '';
      const savedStudents = JSON.parse(localStorage.getItem('studentRegister') || '[]');

      setAnnouncement(savedAnn);
      setVotingRules(savedRules);
      setStudents(savedStudents);
      setCurrentUser(parsedUser);
      fetchResults();
    });

    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [isMounted, router, fetchResults]);

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

    // Attempt to persist candidate/voter through API if available, fallback to local storage
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
            <Link
              href="/admin/import"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              Import CSV Register
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition border border-slate-300"
            >
              Sign Out
            </button>
          </div>
        </header>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Status</span>
            <div className="text-3xl font-bold text-emerald-600 mt-2">Live</div>
            <p className="text-xs text-slate-500 mt-1">Real-time polling active</p>
          </div>
        </div>

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
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition">
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
            {ballotData.map((position) => (
              <div key={position.positionId} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
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
                        <div key={cand.id} className="space-y-1">
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