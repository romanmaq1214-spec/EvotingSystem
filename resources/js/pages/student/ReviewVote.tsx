import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { AlertTriangle, ArrowLeft, CheckCircle2, ShieldAlert, Vote } from 'lucide-react';

interface ReviewItem {
    position_id: number;
    position_name: string;
    selected_candidate: {
        id: number;
        name: string;
        party: string;
    } | null;
}

interface Props {
    election: {
        id: number;
        title: string;
    };
    review_items: ReviewItem[];
    raw_votes: Record<number, number>;
}

export default function ReviewVote({ election, review_items, raw_votes }: Props) {
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirmSubmit = () => {
        setIsSubmitting(true);
        router.post('/student/submit-vote', {
            election_id: election.id,
            votes: raw_votes,
        });
    };

    return (
        <StudentLayout title="Review Your Vote" showBackToDashboard={false}>
            <div className="mx-auto max-w-2xl space-y-8">
                {/* Header */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Final Step
                    </span>
                    <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        Review Your Vote
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Please review your selected candidates carefully before casting your official ballot for <strong>{election.title}</strong>.
                    </p>
                </div>

                {/* Critical Warning Alert */}
                <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 text-amber-900 shadow-sm">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-600" />
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800">
                                Warning: Official Ballot Lock
                            </h3>
                            <p className="mt-1 text-xs text-amber-700">
                                Once your vote is submitted, it cannot be changed or resubmitted. Your student account will be locked from voting in this election again.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Selected Candidates Summary List */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Your Ballot Summary
                        </h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {review_items.map((item) => (
                            <div key={item.position_id} className="flex items-center justify-between p-6">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                        {item.position_name}
                                    </span>
                                    {item.selected_candidate ? (
                                        <div className="mt-1">
                                            <div className="text-base font-bold text-slate-900">
                                                {item.selected_candidate.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {item.selected_candidate.party}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-1 text-sm italic text-slate-400">
                                            Abstained / No selection
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    {item.selected_candidate ? (
                                        <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                            <span>Selected</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                                            Skipped
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back and Submit Actions */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Ballot</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setConfirmModalOpen(true)}
                        className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
                    >
                        <Vote className="h-4 w-4" />
                        <span>Submit Official Vote</span>
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center space-x-3 text-amber-600">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Confirm Final Ballot Submission
                            </h3>
                        </div>

                        <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                            Are you sure you want to cast this vote? This action is <strong>permanent and irrevocable</strong>. Your vote will be cryptographically locked.
                        </p>

                        <div className="mt-6 flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setConfirmModalOpen(false)}
                                disabled={isSubmitting}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                disabled={isSubmitting}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Recording Vote...' : 'Yes, Submit My Vote'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}

