import React from 'react';
import { Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import {
    Vote,
    CheckCircle2,
    Calendar,
    Clock,
    AlertCircle,
    ArrowRight,
    Award,
    Users,
    ShieldCheck,
} from 'lucide-react';

interface Props {
    student: {
        id: number;
        student_id: string;
        name: string;
        course: string;
        year_level: string;
    };
    current_election: {
        id: number;
        title: string;
        description: string;
        status: string;
        start_date: string;
        end_date: string;
        is_open: boolean;
        positions_count: number;
        candidates_count: number;
    } | null;
    has_voted: boolean;
    voted_selections: Array<{
        position: string;
        candidate: string;
        party: string;
    }>;
}

export default function Dashboard({
    student,
    current_election,
    has_voted,
    voted_selections,
}: Props) {
    return (
        <StudentLayout title="Student Dashboard">
            <div className="space-y-8">
                {/* Welcome Student Banner */}
                <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <span className="inline-block rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                                Student Voter Portal
                            </span>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                                Welcome, {student.name}!
                            </h1>
                            <p className="mt-1 text-sm text-blue-100">
                                Student ID: <strong className="font-mono">{student.student_id}</strong> • {student.course} ({student.year_level})
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                            <ShieldCheck className="h-6 w-6 text-emerald-300" />
                            <div className="text-xs">
                                <div className="font-semibold text-white">Eligible Voter</div>
                                <div className="text-blue-200">Account Verified</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Election Card */}
                {current_election ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Current Election
                                    </span>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {current_election.title}
                                    </h2>
                                </div>
                                <div>
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                            current_election.is_open
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                                : 'bg-slate-100 text-slate-700 ring-1 ring-slate-400/20'
                                        }`}
                                    >
                                        <span className={`mr-1.5 h-2 w-2 rounded-full ${
                                            current_election.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                        }`}></span>
                                        Election Status: {current_election.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <p className="mt-5 text-sm text-slate-600">
                                {current_election.description}
                            </p>

                            {/* Schedule */}
                            <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-2">
                                <div className="flex items-center space-x-2 text-slate-600">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span><strong>Starts:</strong> {current_election.start_date}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-slate-600">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span><strong>Ends:</strong> {current_election.end_date}</span>
                                </div>
                            </div>

                            {/* Election Details */}
                            <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
                                <div className="flex items-center space-x-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                    <Award className="h-4 w-4 text-indigo-500" />
                                    <span><strong>{current_election.positions_count}</strong> Positions</span>
                                </div>
                                <div className="flex items-center space-x-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span><strong>{current_election.candidates_count}</strong> Official Candidates</span>
                                </div>
                            </div>
                        </div>

                        {/* Voting Status Panel */}
                        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Your Voting Status
                                </span>

                                {has_voted ? (
                                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                                            <CheckCircle2 className="h-7 w-7" />
                                        </div>
                                        <h3 className="mt-3 text-lg font-bold text-emerald-900">
                                            ✓ Vote Submitted
                                        </h3>
                                        <p className="mt-1 text-xs text-emerald-700">
                                            You have already voted in this election.
                                        </p>
                                        <p className="mt-2 text-[11px] text-slate-500">
                                            Your ballot has been digitally sealed and securely tallied. Duplicate voting is restricted.
                                        </p>
                                    </div>
                                ) : current_election.is_open ? (
                                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-5 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm">
                                            <Vote className="h-7 w-7" />
                                        </div>
                                        <h3 className="mt-3 text-lg font-bold text-amber-900">
                                            Not Yet Voted
                                        </h3>
                                        <p className="mt-1 text-xs text-amber-700">
                                            The ballot is open. Exercise your right to vote!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                                        <AlertCircle className="mx-auto h-10 w-10 text-slate-400" />
                                        <h3 className="mt-2 text-sm font-bold text-slate-800">
                                            Election is not open
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Voting is currently closed or scheduled for later.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className="mt-6">
                                {has_voted ? (
                                    <div className="rounded-xl bg-slate-100 py-3 text-center text-xs font-semibold text-slate-500">
                                        Ballot Completed
                                    </div>
                                ) : current_election.is_open ? (
                                    <Link
                                        href="/student/voting"
                                        className="flex w-full items-center justify-center space-x-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
                                    >
                                        <span>Vote Now</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full rounded-xl bg-slate-200 py-3 text-xs font-semibold text-slate-400"
                                    >
                                        Voting Closed
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <Vote className="mx-auto h-12 w-12 text-slate-300" />
                        <h2 className="mt-3 text-lg font-bold text-slate-800">No Scheduled Election</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            There are currently no active school elections. Please check back later.
                        </p>
                    </div>
                )}

                {/* If student has voted, show their submitted choices summary */}
                {has_voted && voted_selections.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                            Your Cast Selections
                        </h3>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {voted_selections.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
                                >
                                    <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                                        {item.position}
                                    </div>
                                    <div className="mt-1 font-bold text-slate-900">
                                        {item.candidate}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {item.party}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

