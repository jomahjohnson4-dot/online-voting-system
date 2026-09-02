'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wrap state updates to run asynchronously after initial mount
    Promise.resolve().then(() => {
      setMounted(true);
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        router.push('/login');
      }
    });
  }, [router]);

  if (!mounted) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Student Portal</h1>
            <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('currentUser');
              router.push('/login');
            }}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>

        {/* Action Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Cast Your Vote</h2>
            <p className="text-sm text-gray-500">
              Participate in active elections for campus positions and representatives.
            </p>
            <button
              type="button"
              onClick={() => router.push('/student/vote')}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Go to Official Ballot
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Election Guidelines</h2>
            <p className="text-sm text-gray-500">
              Ensure you review candidate manifestos carefully before submitting your final vote.
            </p>
            <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
              Status: Active Election
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}