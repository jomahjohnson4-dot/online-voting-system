'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';

interface Candidate {
  id: string;
  name: string;
  manifesto: string;
}

interface Position {
  id: string;
  name: string;
  candidates: Candidate[];
}

export default function VotePage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [positions, setPositions] = useState<Position[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize client mount state & retrieve local user session
  useEffect(() => {
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

  // Fetch candidate ballot based on student attributes
  useEffect(() => {
    if (!mounted || !user) return;

    let isSubscribed = true;

    const fetchBallot = async () => {
      try {
        const params = new URLSearchParams();
        if (user.collegeId) params.append('collegeId', user.collegeId);
        if (user.departmentId) params.append('departmentId', user.departmentId);
        if (user.courseId) params.append('courseId', user.courseId);
        if (user.yearOfStudy) params.append('yearOfStudy', String(user.yearOfStudy));

        const res = await fetch(`/api/candidates?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch candidate data');
        }

        const text = await res.text();
        const data = text ? JSON.parse(text) : [];

        if (isSubscribed && Array.isArray(data)) {
          setPositions(data);
        } else if (isSubscribed) {
          throw new Error('Invalid ballot structure received from server');
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          const errorObj = err as Error;
          setError(errorObj.message || 'Failed to load ballot data.');
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchBallot();

    return () => {
      isSubscribed = false;
    };
  }, [mounted, user]);

  const handleSelect = (positionId: string, candidateId: string) => {
    setSelections((prev) => ({ ...prev, [positionId]: candidateId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          selections,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Server returned an unparseable response.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit vote.');
      }

      setSuccess(true);
      setTimeout(() => router.push('/student/dashboard'), 2000);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Error submitting vote.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading official ballot...</div>;
  }

  // Count active positions where candidates exist
  const activePositionsCount = positions.filter((p) => p.candidates && p.candidates.length > 0).length;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Official Ballot</h1>
            <p className="text-sm text-slate-500 mt-1">Select your preferred candidate for each position</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/student/dashboard')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium">
            Vote cast successfully! Redirecting to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {positions.map((pos) => {
            const hasCandidates = pos.candidates && pos.candidates.length > 0;

            return (
              <div key={pos.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">{pos.name}</h2>
                
                {!hasCandidates ? (
                  <p className="text-sm text-slate-400 italic py-2">
                    No registered candidates for your unit.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {pos.candidates.map((cand) => {
                      const isSelected = selections[pos.id] === cand.id;
                      return (
                        <label
                          key={cand.id}
                          onClick={() => handleSelect(pos.id, cand.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition flex flex-col space-y-1 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-900">{cand.name}</span>
                            <input
                              type="radio"
                              name={pos.id}
                              checked={isSelected}
                              onChange={() => handleSelect(pos.id, cand.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{cand.manifesto}</p>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={
              submitting ||
              activePositionsCount === 0 ||
              Object.keys(selections).length < activePositionsCount
            }
            className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? 'Submitting Ballot...' : 'Submit Official Vote'}
          </button>
        </form>
      </div>
    </main>
  );
}