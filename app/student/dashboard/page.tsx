'use client';

import { useSyncExternalStore, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface StudentSession {
  id: string;
  name: string;
  registrationNumber: string;
  role: string;
  collegeId?: string;
  departmentId?: string;
  courseId?: string;
  yearOfStudy?: number;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dedicated states to prevent notice interference
  const [announcement, setAnnouncement] = useState('');
  const [customRules, setCustomRules] = useState('');

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isMounted) return;

    const loadSessionAndData = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        router.push('/login');
        return;
      }

      try {
        const parsedUser: StudentSession = JSON.parse(storedUser);
        setStudent(parsedUser);

        const votedKey = `voted_${parsedUser.id}`;
        const localVoted = localStorage.getItem(votedKey);
        if (localVoted === 'true') {
          setHasVoted(true);
        }

        setAnnouncement(localStorage.getItem('electionAnnouncement') || '');
        setCustomRules(localStorage.getItem('electionRules') || '');
      } catch (err) {
        console.error('Failed to load dashboard state:', err);
        localStorage.removeItem('currentUser');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadSessionAndData();
  }, [isMounted, router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  if (!isMounted || loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <p className="text-sm font-medium">Loading Student Dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Portal</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="text-blue-600 font-semibold">{student?.name}</span> ({student?.registrationNumber})
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition border border-red-100 self-start md:self-auto"
          >
            Logout
          </button>
        </header>

        {/* Student Meta Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-sm">
          <div>
            <span className="block text-xs text-slate-400 font-medium uppercase tracking-wider">College</span>
            <span className="font-semibold text-slate-800 mt-1 block">{student?.collegeId || 'CoICT'}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium uppercase tracking-wider">Department</span>
            <span className="font-semibold text-slate-800 mt-1 block">{student?.departmentId || 'CSE'}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium uppercase tracking-wider">Course</span>
            <span className="font-semibold text-slate-800 mt-1 block">{student?.courseId || 'BIT'}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium uppercase tracking-wider">Year of Study</span>
            <span className="font-semibold text-slate-800 mt-1 block">Year {student?.yearOfStudy || 1}</span>
          </div>
        </div>

        {/* Dynamic Admin Announcement Banner */}
        {announcement && (
          <section className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm text-amber-900 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📢</span>
              <h2 className="font-bold text-base text-amber-950">Official Election Announcement</h2>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line bg-amber-100/50 p-3 rounded-xl border border-amber-200/60">
              {announcement}
            </p>
          </section>
        )}

        {/* App Guide & Permanent Voter Instructions Section */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-lg">💡</span>
            <h2 className="text-lg font-bold text-slate-900">About This Voting Application & Guidelines</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800">How to Use This Portal:</h3>
              <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                <li>Click <strong>Go to Official Ballot</strong> to view available candidates.</li>
                <li>Carefully review candidate profiles and manifestos.</li>
                <li>Submit your choices for each contested position.</li>
                <li>Check <strong>View Live Results</strong> to follow real-time election turnout.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Key Voting Rules:</h3>
              <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                <li>Each registered student is permitted to vote <strong>only once</strong>.</li>
                <li>Votes are encrypted and anonymously logged for full election transparency.</li>
                <li>Once submitted, votes cannot be edited or modified.</li>
              </ul>

              {/* Additional Admin Notice */}
              {customRules && (
                <div className="pt-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Additional Admin Notice:</span>
                  <p className="whitespace-pre-line leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs font-medium">
                    {customRules}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Voting Actions Grid (Positioned at the Bottom) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">Cast Your Vote</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Participate in active elections for campus positions and representatives scoped to your course.
              </p>
            </div>

            {hasVoted ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-sm font-bold text-emerald-700">✓ Official Ballot Submitted</span>
              </div>
            ) : (
              <Link
                href="/vote"
                className="w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm block text-sm"
              >
                Go to Official Ballot →
              </Link>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Election Standings</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Status: Active Election
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Track candidate tallies and view live vote percentage breakdowns in real time.
              </p>
            </div>

            <Link
              href="/results"
              className="w-full text-center py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition shadow-sm block text-sm"
            >
              View Live Results
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}