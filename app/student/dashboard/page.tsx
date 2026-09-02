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

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isMounted) return;

    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser: StudentSession = JSON.parse(storedUser);
    setStudent(parsedUser);

    // Check voting status for current user session
    const checkVotingStatus = async () => {
      try {
        const res = await fetch('/api/results');
        if (res.ok) {
          const results = await res.json();
          // Evaluate if candidate counts reflect completed ballot
          const votedKey = `voted_${parsedUser.id}`;
          const localVoted = localStorage.getItem(votedKey);
          if (localVoted === 'true') {
            setHasVoted(true);
          }
        }
      } catch (err) {
        console.error('Failed to check voting status:', err);
      } finally {
        setLoading(false);
      }
    };

    Promise.resolve().then(() => {
      checkVotingStatus();
    });
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Portal</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="text-blue-600 font-semibold">{student?.name}</span> ({student?.registrationNumber})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition border border-red-100 self-start md:self-auto"
          >
            Logout
          </button>
        </header>

        {/* Student Meta Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-sm">
          <div>
            <span className="block text-xs text-slate-400 font-medium">College</span>
            <span className="font-semibold text-slate-800">{student?.collegeId || 'CoICT'}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium">Department</span>
            <span className="font-semibold text-slate-800">{student?.departmentId || 'CSE'}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium">Course</span>
            <span className="font-semibold text-slate-800">{student?.courseId || 'BIT'}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium">Year of Study</span>
            <span className="font-semibold text-slate-800">Year {student?.yearOfStudy || 1}</span>
          </div>
        </div>

        {/* Voting Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">Cast Your Vote</h2>
              <p className="text-sm text-slate-500">
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
                Go to Official Ballot
              </Link>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">Election Standings</h2>
              <p className="text-sm text-slate-500">
                Track candidate tallies and view live vote percentage breakdowns in real time.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Status: Active Election
                </span>
              </div>
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
