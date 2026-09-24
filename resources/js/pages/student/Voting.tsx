import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Vote, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

interface Candidate {
    id: number;
    name: string;
    party: string;
    photo: string | null;
    platform: string | null;
}

interface Position {
    id: number;
    name: string;
    description: string | null;
    max_votes: number;
    candidates: Candidate[];
}

interface Props {
    election: {
        id: number;
        title: string;
        description: string;
        start_date: string;
        end_date: string;
    };
    positions: Position[];
}

export default function Voting({ election, positions }: Props) {
    // votes state: { [position_id]: candidate_id }
    const [votes, setVotes] = useState<Record<number, number>>({});
    const [error, setError] = useState<string | null>(null);

    const handleSelectCandidate = (positionId: number, candidateId: number) => {
        setVotes((prev) => ({
            ...prev,
            [positionId]: candidateId,
        }));
        setError(null);
    };

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if voter made selections
        const selectedCount = Object.values(votes).filter(Boolean).length;
        if (selectedCount === 0) {
            setError('Please select at least one candidate before reviewing your vote.');
            return;
        }

        router.post('/student/review', {
            election_id: election.id,
            votes,
        });
    };

    return (
        <StudentLayout title={`Ballot | ${election.title}`} showBackToDashboard>
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center space-x-3 text-xs font-semibold uppercase tracking-wider text-blue-600">
                        <Vote className="h-4 w-4" />
                        <span>Official Voting Ballot</span>
                    </div>
                    <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">
                        {election.title}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Select your chosen candidate for each position. When finished, click <strong>Review Vote</strong> to verify your choices before final submission.
                    </p>
                </div>

                {error && (
                    <div className="flex items-center space-x-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-600" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Ballot Positions Form */}
                <form onSubmit={handleReview} className="space-y-8">
                    {positions.map((pos) => {
                        const selectedCandidateId = votes[pos.id];

                        return (
                            <div
                                key={pos.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900">
                                            {pos.name}
                                        </h2>
                                        <span className="text-xs font-medium text-slate-500">
                                            Select 1 Candidate
                                        </span>
                                    </div>
                                    {pos.description && (
                                        <p className="mt-0.5 text-xs text-slate-500">{pos.description}</p>
                                    )}
                                </div>

                                <div className="p-6">
                                    {pos.candidates.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {pos.candidates.map((candidate) => {
                                                const isSelected = selectedCandidateId === candidate.id;

                                                return (
                                                    <label
                                                        key={candidate.id}
                                                        className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                                                            isSelected
                                                                ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-600/20'
                                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                                        }`}
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <input
                                                                type="radio"
                                                                name={`position_${pos.id}`}
                                                                value={candidate.id}
                                                                checked={isSelected}
                                                                onChange={() => handleSelectCandidate(pos.id, candidate.id)}
                                                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-bold text-slate-900">
                                                                    {candidate.name}
                                                                </div>
                                                                <div className="text-xs font-semibold text-blue-600">
                                                                    {candidate.party}
                                                                </div>
                                                                {candidate.platform && (
                                                                    <p className="mt-2 line-clamp-3 text-xs text-slate-500">
                                                                        "{candidate.platform}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 border-t border-slate-100 pt-2 text-right">
                                                            <span
                                                                className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                                                    isSelected
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-slate-100 text-slate-500'
                                                                }`}
                                                            >
                                                                {isSelected ? '✓ Selected' : 'Click to Select'}
                                                            </span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center text-xs text-slate-400">
                                            No candidates registered for this position.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Review Button Footer */}
                    <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:p-5">
                        <div className="text-xs text-slate-500">
                            <strong>{Object.values(votes).filter(Boolean).length}</strong> of <strong>{positions.length}</strong> positions selected
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
                        >
                            <span>Review Vote</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>
        </StudentLayout>
    );
}

