import React from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { BarChart3, Award, Users, CheckCircle2, TrendingUp, Vote } from 'lucide-react';

interface CandidateResult {
    id: number;
    name: string;
    party: string;
    photo: string | null;
    votes_count: number;
    percentage: number;
}

interface PositionResult {
    id: number;
    name: string;
    description: string | null;
    total_votes: number;
    candidates: CandidateResult[];
}

interface Props {
    elections: Array<{ id: number; title: string; status: string }>;
    selected_election: {
        id: number;
        title: string;
        status: string;
        start_date: string;
        end_date: string;
        total_votes: number;
        unique_voters: number;
    } | null;
    results: PositionResult[];
}

export default function Results({ elections, selected_election, results }: Props) {
    const handleElectionChange = (electionId: number) => {
        router.get('/admin/results', { election_id: electionId });
    };

    return (
        <AdminLayout title="Election Results & Statistics">
            <div className="space-y-8">
                {/* Election Header & Selector */}
                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                            <BarChart3 className="h-4 w-4" />
                            <span>Official Election Tally</span>
                        </div>
                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            {selected_election?.title || 'No Election Selected'}
                        </h2>
                        {selected_election && (
                            <p className="mt-1 text-xs text-slate-500">
                                Total votes cast: <strong>{selected_election.total_votes}</strong> • Unique voters: <strong>{selected_election.unique_voters}</strong>
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-semibold text-slate-500">Election:</label>
                        <select
                            value={selected_election?.id || ''}
                            onChange={(e) => handleElectionChange(Number(e.target.value))}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm focus:border-indigo-500"
                        >
                            {elections.map((el) => (
                                <option key={el.id} value={el.id}>
                                    {el.title} ({el.status})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results by Position */}
                {results.length > 0 ? (
                    <div className="space-y-8">
                        {results.map((pos) => {
                            const leader = pos.candidates[0];

                            return (
                                <div
                                    key={pos.id}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                >
                                    <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Award className="h-5 w-5 text-indigo-600" />
                                                <h3 className="text-base font-bold uppercase tracking-tight text-slate-900">
                                                    {pos.name}
                                                </h3>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500">
                                                Total Position Votes: <strong>{pos.total_votes}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {pos.candidates.map((cand, idx) => {
                                            const isLeading = idx === 0 && cand.votes_count > 0;

                                            return (
                                                <div key={cand.id} className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                                                                isLeading
                                                                    ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400/30'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                #{idx + 1}
                                                            </span>
                                                            <div>
                                                                <span className="font-bold text-slate-900 text-sm">
                                                                    {cand.name}
                                                                </span>
                                                                <span className="ml-2 text-slate-400">
                                                                    ({cand.party})
                                                                </span>
                                                                {isLeading && (
                                                                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                                                                        Leading
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="text-right font-mono">
                                                            <span className="text-sm font-bold text-slate-900">
                                                                {cand.votes_count} votes
                                                            </span>
                                                            <span className="ml-2 font-semibold text-indigo-600">
                                                                {cand.percentage}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Visual Bar Chart */}
                                                    <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ${
                                                                isLeading
                                                                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                                                                    : 'bg-slate-400'
                                                            }`}
                                                            style={{ width: `${Math.max(cand.percentage, cand.votes_count > 0 ? 2 : 0)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
                        <Vote className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-3 text-sm font-bold text-slate-800">No Election Results Available</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Select an election with registered positions and cast votes.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

