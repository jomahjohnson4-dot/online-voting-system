'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function AdminManagePage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [newPositionName, setNewPositionName] = useState('');
  const [candidateInputs, setCandidateInputs] = useState<Record<string, { name: string; manifesto: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

    const fetchPositions = async () => {
      try {
        const res = await fetch('/api/positions');
        if (res.ok) {
          const data = await res.json();
          // Ensure every position object has a candidates array attached
          const sanitizedData = (Array.isArray(data) ? data : []).map((pos) => ({
            ...pos,
            candidates: Array.isArray(pos.candidates) ? pos.candidates : [],
          }));
          setPositions(sanitizedData);
        }
      } catch (err) {
        console.error('Failed to load positions:', err);
      } finally {
        setLoading(false);
      }
    };

    Promise.resolve().then(() => {
      fetchPositions();
    });
  }, [isMounted, router]);

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPositionName.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPositionName }),
      });

      if (res.ok) {
        const newPos = await res.json();
        setPositions((prev) => [
          ...prev,
          { ...newPos, candidates: newPos.candidates || [] },
        ]);
        setNewPositionName('');
      }
    } catch (err) {
      console.error('Failed to add position:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCandidate = async (positionId: string) => {
    const input = candidateInputs[positionId];
    if (!input || !input.name.trim()) return;

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId,
          name: input.name,
          manifesto: input.manifesto,
        }),
      });

      if (res.ok) {
        const newCand: Candidate = await res.json();
        setPositions((prev) =>
          prev.map((pos) =>
            pos.id === positionId
              ? { ...pos, candidates: [...(pos.candidates || []), newCand] }
              : pos
          )
        );
        setCandidateInputs((prev) => ({ ...prev, [positionId]: { name: '', manifesto: '' } }));
      }
    } catch (err) {
      console.error('Failed to add candidate:', err);
    }
  };

  if (!isMounted || loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <p className="text-sm font-medium">Loading Management Portal...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Positions & Competitors</h1>
            <p className="text-sm text-slate-500 mt-1">Add or configure active election candidates</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition border border-slate-200 self-start md:self-auto"
          >
            Dashboard
          </Link>
        </header>

        {/* Add Position Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Create New Position</h2>
          <form onSubmit={handleAddPosition} className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. Guild President, Vice President"
              value={newPositionName}
              onChange={(e) => setNewPositionName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={submitting || !newPositionName.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition"
            >
              {submitting ? 'Adding...' : 'Add Position'}
            </button>
          </form>
        </div>

        {/* Positions & Candidate Management Cards */}
        <div className="space-y-6">
          {positions.map((pos) => {
            const currentCandidates = pos.candidates || [];

            return (
              <div key={pos.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">{pos.name}</h3>

                {/* Current Candidates */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Competitors</span>
                  {currentCandidates.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No competitors added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentCandidates.map((cand) => (
                        <div key={cand.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="font-bold text-sm text-slate-900">{cand.name}</span>
                          {cand.manifesto && (
                            <p className="text-xs text-slate-500 line-clamp-2">{cand.manifesto}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Candidate Sub-form */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Competitor to {pos.name}</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Candidate Name"
                      value={candidateInputs[pos.id]?.name || ''}
                      onChange={(e) =>
                        setCandidateInputs((prev) => ({
                          ...prev,
                          [pos.id]: { ...prev[pos.id], name: e.target.value },
                        }))
                      }
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Manifesto / Summary"
                      value={candidateInputs[pos.id]?.manifesto || ''}
                      onChange={(e) =>
                        setCandidateInputs((prev) => ({
                          ...prev,
                          [pos.id]: { ...prev[pos.id], manifesto: e.target.value },
                        }))
                      }
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <button
                    onClick={() => handleAddCandidate(pos.id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
                  >
                    Save Competitor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}