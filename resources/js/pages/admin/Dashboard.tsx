import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import StatCard from '@/components/StatCard';
import {
    Users,
    UserCheck,
    Award,
    Vote,
    CheckSquare,
    Calendar,
    ArrowRight,
    TrendingUp,
    Clock,
    Activity,
} from 'lucide-react';

interface Props {
    stats: {
        total_students: number;
        total_candidates: number;
        total_positions: number;
        active_elections: number;
        total_votes: number;
    };
    current_election: {
        id: number;
        title: string;
        description: string;
        status: string;
        start_date: string;
        end_date: string;
        total_positions: number;
        total_candidates: number;
        votes_cast: number;
        unique_voters: number;
        participation_rate: number;
    } | null;
    recent_activity: Array<{
        id: number;
        position_name: string;
        candidate_name: string;
        candidate_party: string;
        voter_code: string;
        voter_course: string;
        time_ago: string;
    }>;
}

export default function Dashboard({ stats, current_election, recent_activity }: Props) {
    return (
        <AdminLayout title="Admin Dashboard">
            <div className="space-y-8">
                {/* 5 Statistics Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Students"
                        value={stats.total_students}
                        description="Enrolled voters"
                        icon={<Users className="h-6 w-6" />}
                        color="blue"
                    />
                    <StatCard
                        title="Total Candidates"
                        value={stats.total_candidates}
                        description="Vying for council"
                        icon={<UserCheck className="h-6 w-6" />}
                        color="purple"
                    />
                    <StatCard
                        title="Total Positions"
                        value={stats.total_positions}
                        description="Active council seats"
                        icon={<Award className="h-6 w-6" />}
                        color="amber"
                    />
                    <StatCard
                        title="Active Elections"
                        value={stats.active_elections}
                        description="Accepting ballots"
                        icon={<Vote className="h-6 w-6" />}
                        color="green"
                    />
                    <StatCard
                        title="Total Votes"
                        value={stats.total_votes}
                        description="Ballots submitted"
                        icon={<CheckSquare className="h-6 w-6" />}
                        color="indigo"
                    />
                </div>

                {/* Current Election & Voting Participation */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Active Election Overview Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Current Election
                                </span>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {current_election?.title || 'No active election'}
                                </h2>
                            </div>
                            {current_election && (
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                            current_election.status === 'Open'
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                                : current_election.status === 'Upcoming'
                                                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                                                : 'bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        <span className={`mr-1.5 h-2 w-2 rounded-full ${
                                            current_election.status === 'Open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                        }`}></span>
                                        {current_election.status.toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {current_election ? (
                            <div className="mt-6 space-y-6">
                                <p className="text-sm text-slate-600">
                                    {current_election.description}
                                </p>

                                {/* Date Schedule */}
                                <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-2">
                                    <div className="flex items-center space-x-2 text-slate-600">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <span><strong>Starts:</strong> {current_election.start_date}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-slate-600">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <span><strong>Ends:</strong> {current_election.end_date}</span>
                                    </div>
                                </div>

                                {/* Voter Participation Progress Bar */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="font-semibold text-slate-700">Voter Participation Rate</span>
                                        <span className="font-bold text-indigo-600">
                                            {current_election.participation_rate}%
                                            <span className="text-xs font-normal text-slate-500">
                                                {' '}({current_election.unique_voters} / {stats.total_students} students)
                                            </span>
                                        </span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                                            style={{ width: `${Math.min(current_election.participation_rate, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                    <div className="text-xs text-slate-500">
                                        Ballot contains <strong>{current_election.total_positions}</strong> positions and <strong>{current_election.total_candidates}</strong> approved candidates.
                                    </div>
                                    <Link
                                        href="/admin/results"
                                        className="inline-flex items-center space-x-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-slate-800"
                                    >
                                        <span>View Live Tally</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Vote className="mx-auto h-12 w-12 text-slate-300" />
                                <h3 className="mt-3 text-sm font-semibold text-slate-900">No active election</h3>
                                <p className="mt-1 text-xs text-slate-500">Create or open an election to accept student votes.</p>
                                <Link
                                    href="/admin/elections"
                                    className="mt-4 inline-flex items-center space-x-1 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                                >
                                    <span>Manage Elections</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Management Shortcuts */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                            Quick Management
                        </h3>
                        <div className="mt-4 space-y-3">
                            <Link
                                href="/admin/students"
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">Manage Students</div>
                                        <div className="text-[11px] text-slate-500">{stats.total_students} registered</div>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                            </Link>

                            <Link
                                href="/admin/candidates"
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                        <UserCheck className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">Manage Candidates</div>
                                        <div className="text-[11px] text-slate-500">{stats.total_candidates} registered</div>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                            </Link>

                            <Link
                                href="/admin/positions"
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                        <Award className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">Manage Positions</div>
                                        <div className="text-[11px] text-slate-500">{stats.total_positions} positions</div>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                            </Link>

                            <Link
                                href="/admin/results"
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">Election Results</div>
                                        <div className="text-[11px] text-slate-500">{stats.total_votes} votes recorded</div>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-base font-bold text-slate-900">Recent Voting Activity</h3>
                        </div>
                        <span className="text-xs text-slate-400">Live feed</span>
                    </div>

                    {recent_activity.length > 0 ? (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        <th className="py-3 px-4">Position</th>
                                        <th className="py-3 px-4">Candidate Voted</th>
                                        <th className="py-3 px-4">Party</th>
                                        <th className="py-3 px-4">Voter (Masked ID)</th>
                                        <th className="py-3 px-4">Course</th>
                                        <th className="py-3 px-4 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recent_activity.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80">
                                            <td className="py-3 px-4 font-semibold text-slate-800">{item.position_name}</td>
                                            <td className="py-3 px-4 text-slate-900 font-medium">{item.candidate_name}</td>
                                            <td className="py-3 px-4 text-slate-500">{item.candidate_party}</td>
                                            <td className="py-3 px-4 font-mono text-slate-600">{item.voter_code}</td>
                                            <td className="py-3 px-4 text-slate-500">{item.voter_course || 'N/A'}</td>
                                            <td className="py-3 px-4 text-right text-slate-400">{item.time_ago}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-10 text-center text-xs text-slate-400">
                            No votes have been cast in this election yet.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

