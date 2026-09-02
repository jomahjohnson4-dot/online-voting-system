'use client';

import { useSyncExternalStore, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserSession {
  id: string;
  name: string;
  registrationNumber: string;
}

interface Candidate {
  id: string;
  name: string;
  manifesto?: string;
}

interface Position {
  id: string;
  name: string;
  candidates?: Candidate[];
}

export default function VotePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeManifesto, setActiveManifesto] = useState<{ candidate: string; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
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

    try {
      const parsedUser: UserSession = JSON.parse(storedUser);

      const votedKey = `voted_${parsedUser.id}`;
      const userAlreadyVoted = localStorage.getItem(votedKey) === 'true';

      const fetchPositions = async () => {
        try {
          const res = await fetch('/api/positions');
          if (res.ok) {
            const data = await res.json();
            const sanitizedData = (Array.isArray(data) ? data : []).map((pos) => ({
              ...pos,
              candidates: Array.isArray(pos.candidates) ? pos.candidates : [],
            }));
            setPositions(sanitizedData);
          }
        } catch (err) {
          console.error('Failed to load ballot positions:', err);
        } finally {
          setLoading(false);
        }
      };

      Promise.resolve().then(() => {
        setCurrentUser(parsedUser);
        if (userAlreadyVoted) {
          setHasVoted(true);
          setLoading(false);
        } else {
          fetchPositions();
        }
      });
    } catch (e) {
      console.error('Failed to parse user session:', e);
      router.push('/login');
    }
  }, [isMounted, router]);

  const handleSelect = (positionId: string, candidateId: string) => {
    setSelections((prev) => ({
      ...prev,
      [positionId]: candidateId,
    }));
  };

  const handleSubmitVotes = async () => {
    if (!currentUser) return;
    setSubmitting(true);

    try {
      // Formats request body to match backend expectations: { userId, selections, electionId }
      const payload = {
        userId: currentUser.id,
        selections,
        electionId: 'el_1',
      };

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        localStorage.setItem(`voted_${currentUser.id}`, 'true');
        setHasVoted(true);
      } else {
        alert(data.error || 'Failed to submit ballot. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit votes:', err);
      alert('Network connection issue. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted || loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <p className="text-sm font-medium">Loading Official Ballot...</p>
      </main>
    );
  }

  if (hasVoted) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h1 className="text-xl font-bold">Ballot Already Submitted</h1>
          <p className="text-sm text-slate-500">
            Thank you, {currentUser?.name}. Your votes have been securely recorded in the system.
          </p>
          <div className="pt-2">
            <Link
              href="/results"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition block text-center"
            >
              View Election Results
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Official Election Ballot</h1>
            <p className="text-sm text-slate-500 mt-1">
              Select one candidate per position. Click submit when finished.
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition border border-slate-200 self-start md:self-auto"
          >
            Dashboard
          </Link>
        </header>

        {/* Positions List */}
        {positions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2 shadow-sm">
            <p className="text-base font-semibold text-slate-800">No Open Positions</p>
            <p className="text-sm text-slate-500">There are currently no active ballots available for voting.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {positions.map((position) => {
              const candList = position.candidates || [];

              return (
                <div key={position.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                    {position.name}
                  </h2>

                  {candList.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No candidates available for this position.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candList.map((cand) => {
                        const isSelected = selections[position.id] === cand.id;

                        return (
                          <div
                            key={cand.id}
                            onClick={() => handleSelect(position.id, cand.id)}
                            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-slate-900 block">{cand.name}</span>
                                <span className="text-xs text-slate-400">Candidate ID: {cand.id}</span>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <span className="text-xs font-bold">✓</span>}
                              </div>
                            </div>

                            {cand.manifesto && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveManifesto({ candidate: cand.name, text: cand.manifesto! });
                                }}
                                className="text-xs text-blue-600 hover:underline font-medium self-start"
                              >
                                Read Manifesto →
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submission Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">
                Selected <span className="font-bold text-slate-900">{Object.keys(selections).length}</span> of {positions.length} positions
              </span>
              <button
                onClick={handleSubmitVotes}
                disabled={submitting || Object.keys(selections).length === 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition shadow-sm text-sm"
              >
                {submitting ? 'Submitting Ballot...' : 'Submit Official Ballot'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manifesto Modal */}
      {activeManifesto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">{activeManifesto.candidate}&apos;s Manifesto</h3>
              <button
                onClick={() => setActiveManifesto(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {activeManifesto.text}
            </p>
            <button
              onClick={() => setActiveManifesto(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}