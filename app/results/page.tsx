'use client';

import { useSyncExternalStore, useState, useEffect } from 'react';
import Link from 'next/link';

interface CandidateResult {
  id: string;
  name: string;
  manifesto?: string;
  voteCount?: number;
  votes?: number;
  percentage?: number | string;
}

interface PositionResult {
  positionId?: string;
  id?: string;
  positionName?: string;
  name?: string;
  totalVotesCast?: number;
  candidates: CandidateResult[];
}

export default function PublicResultsPage() {
  const [ballotData, setBallotData] = useState<PositionResult[]>([]);
  const [loading, setLoading] = useState(true);

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isMounted) return;

    const fetchResults = async () => {
      try {
        const res = await fetch('/api/results', { cache: 'no-store' });
        if (res.ok) {
          const rawData = await res.json();

          // Safely extract array whether backend returns array or wrapper object
          const extractedPositions: PositionResult[] = Array.isArray(rawData)
            ? rawData
            : rawData.positions || rawData.results || [];

          setBallotData(extractedPositions);
        } else {
          setBallotData([]);
        }
      } catch (err) {
        console.error('Failed to load live election results:', err);
        setBallotData([]);
      } finally {
        setLoading(false);
      }
    };

    Promise.resolve().then(() => {
      fetchResults();
    });

    const interval = setInterval(fetchResults, 3000);
    return () => clearInterval(interval);
  }, [isMounted]);

  if (!isMounted || loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <p className="text-sm font-medium">Loading Live Election Standings...</p>
      </main>
    );
  }

  // Calculate total votes across all candidates
  const grandTotalVotes = ballotData.reduce((acc, pos) => {
    if (pos.totalVotesCast !== undefined) return acc + pos.totalVotesCast;
    const posVotes = pos.candidates?.reduce(
      (sum, c) => sum + (c.voteCount ?? c.votes ?? 0),
      0
    );
    return acc + (posVotes || 0);
  }, 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-2xl font-bold text-slate-900">Live Election Standings</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Real-time vote aggregation & candidate lead metrics
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-center">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                Total Votes Recorded
              </span>
              <span className="text-lg font-bold text-slate-900">{grandTotalVotes}</span>
            </div>
            <Link
              href="/student/dashboard"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition border border-slate-200"
            >
              Dashboard
            </Link>
          </div>
        </header>

        {/* Results Body */}
        {ballotData.length === 0 || grandTotalVotes === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
            <p className="text-lg font-bold text-slate-800">No Election Results Available</p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Voting has either not commenced or no ballots have been registered yet. Check back once votes are cast.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ballotData.map((position, posIndex) => {
              // Deterministic key: avoids Math.random() during render
              const posId = position.positionId || position.id || `pos_idx_${posIndex}`;
              const posName = position.positionName || position.name || 'Position';
              const posTotal =
                position.totalVotesCast ??
                position.candidates?.reduce(
                  (acc, c) => acc + (c.voteCount ?? c.votes ?? 0),
                  0
                ) ??
                0;

              return (
                <div
                  key={posId}
                  className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="font-bold text-lg text-slate-800">{posName}</h2>
                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-mono font-medium">
                      Total: {posTotal} Votes
                    </span>
                  </div>

                  <div className="space-y-4">
                    {!position.candidates || position.candidates.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">
                        No candidates registered for this position.
                      </p>
                    ) : (
                      position.candidates.map((cand, candIdx) => {
                        const candKey = cand.id || `cand_${posId}_${candIdx}`;
                        const count = cand.voteCount ?? cand.votes ?? 0;
                        const numPercentage =
                          posTotal > 0
                            ? Number(((count / posTotal) * 100).toFixed(1))
                            : 0;

                        return (
                          <div key={candKey} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">
                                  {cand.name}
                                </span>
                                {candIdx === 0 && count > 0 && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                                    LEAD
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 font-mono">
                                {count} votes ({numPercentage}%)
                              </span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  candIdx === 0 && count > 0 ? 'bg-blue-600' : 'bg-slate-400'
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
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}