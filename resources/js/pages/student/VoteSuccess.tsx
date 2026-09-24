import React from 'react';
import { Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { CheckCircle2, ShieldCheck, ArrowRight, Vote } from 'lucide-react';

interface Props {
    election_title: string;
}

export default function VoteSuccess({ election_title }: Props) {
    return (
        <StudentLayout title="Vote Submitted Successfully">
            <div className="mx-auto max-w-lg py-12 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/20 ring-8 ring-emerald-50">
                    <CheckCircle2 className="h-12 w-12" />
                </div>

                <h1 className="mt-6 text-3xl font-black text-slate-900">
                    Vote Submitted!
                </h1>

                <p className="mt-2 text-base font-semibold text-emerald-700">
                    Thank you for participating in {election_title}.
                </p>

                <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                    Your official ballot has been recorded and safely encrypted in the central database. Your vote has contributed to the student body election tally.
                </p>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>Verification Certificate</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <div><strong>Election:</strong> {election_title}</div>
                        <div><strong>Status:</strong> Digital Ballot Sealed</div>
                        <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
                    </div>
                </div>

                <div className="mt-8">
                    <Link
                        href="/student/dashboard"
                        className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
                    >
                        <span>Return to Student Dashboard</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </StudentLayout>
    );
}

