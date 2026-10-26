import React from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { BarChart3, Award, Vote } from 'lucide-react';

interface CandidateResult {
    id: number;
    name: string;
    party: string;
    photo: string | null;
    votes_count: number;
    percentage: number;
    department_votes: Array<{ department: string; votes_count: number }>;
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
    departments: string[];
}

const departmentStyles: Record<string, { label: string; bar: string; swatch: string }> = {
    BSIT: { label: 'BSIT', bar: 'bg-violet-600', swatch: 'bg-violet-600' },
    BSAB: { label: 'BSAB', bar: 'bg-emerald-600', swatch: 'bg-emerald-600' },
    BEED: { label: 'BEED', bar: 'bg-blue-600', swatch: 'bg-blue-600' },
    OTHER: { label: 'Other', bar: 'bg-slate-500', swatch: 'bg-slate-500' },
};

export default function Results({ elections, selected_election, results, departments }: Props) {
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
                            const maxDepartmentVotes = Math.max(
                                ...pos.candidates.flatMap((candidate) => candidate.department_votes.map((item) => item.votes_count)),
                                0,
                            );
                            const chartMaximum = Math.max(4, Math.ceil(maxDepartmentVotes / 4) * 4);
                            const chartStep = chartMaximum / 4;
                            const chartWidth = Math.max(680, pos.candidates.length * 148 + 88);

                            return (
                                <div
                                    key={pos.id}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                >
                                    <div className="border-b border-slate-100 bg-white px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Award className="h-5 w-5 text-indigo-600" />
                                                <h3 className="text-base font-bold tracking-tight text-slate-900">
                                                    {pos.name}
                                                </h3>
                                            </div>
                                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                                {pos.total_votes} total votes
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 sm:p-7">
                                        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6" aria-label={`${pos.name} department vote bar graph`}>
                                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">Votes by candidate and department</h4>
                                                    <p className="mt-1 text-xs text-slate-500">Each bar shows votes from students in that department.</p>
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                                    {departments.map((department) => {
                                                        const style = departmentStyles[department] || departmentStyles.OTHER;
                                                        return (
                                                            <span key={department} className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                                                                <span className={`h-2.5 w-2.5 rounded-sm ${style.swatch}`} />
                                                                {style.label}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="mt-5 overflow-x-auto rounded-lg bg-slate-50 px-3 pt-4 pb-2">
                                                <div className="relative mx-auto h-[370px]" style={{ width: chartWidth }}>
                                                    <div className="absolute bottom-[98px] left-0 top-3 flex w-10 flex-col justify-between text-right text-[10px] font-medium tabular-nums text-slate-500">
                                                        {[4, 3, 2, 1, 0].map((tick) => (
                                                            <span key={tick}>{Math.round(chartStep * tick)}</span>
                                                        ))}
                                                    </div>
                                                    <div className="absolute bottom-[98px] left-11 right-2 top-3 border-b border-l border-slate-400">
                                                        {[0, 1, 2, 3, 4].map((tick) => (
                                                            <div
                                                                key={tick}
                                                                className="absolute left-0 right-0 border-t border-slate-200"
                                                                style={{ bottom: `${tick * 25}%` }}
                                                            />
                                                        ))}
                                                        <div className="absolute inset-0 flex items-end justify-around px-3">
                                                            {pos.candidates.map((candidate, candidateIndex) => (
                                                                <div key={candidate.id} className="flex h-full min-w-0 flex-1 items-end justify-center gap-1.5 px-2">
                                                                    {candidate.department_votes.map((item) => {
                                                                        const style = departmentStyles[item.department] || departmentStyles.OTHER;
                                                                        const height = item.votes_count > 0 ? Math.max((item.votes_count / chartMaximum) * 100, 1.5) : 0;
                                                                        return (
                                                                            <div
                                                                                key={item.department}
                                                                                title={`${candidate.name} - ${style.label}: ${item.votes_count} votes`}
                                                                                className={`z-10 w-5 rounded-t-md shadow-sm transition-all duration-500 sm:w-7 ${style.bar}`}
                                                                                style={{ height: `${height}%` }}
                                                                            />
                                                                        );
                                                                    })}
                                                                    <span className="sr-only">Candidate {candidateIndex + 1}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-0 left-11 right-2 grid min-h-[90px] items-start text-center" style={{ gridTemplateColumns: `repeat(${Math.max(pos.candidates.length, 1)}, minmax(0, 1fr))` }}>
                                                        {pos.candidates.map((candidate, index) => (
                                                            <div key={candidate.id} className="flex flex-col items-center px-1.5 text-center">
                                                                <div className="relative mb-1.5">
                                                                    {candidate.photo ? (
                                                                        <img src={candidate.photo} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200" />
                                                                    ) : (
                                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                                                                            {candidate.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                                                                        </span>
                                                                    )}
                                                                    <span className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-slate-50 ${index === 0 && candidate.votes_count > 0 ? 'bg-amber-400 text-amber-950' : 'bg-slate-500 text-white'}`}>
                                                                        {index + 1}
                                                                    </span>
                                                                </div>
                                                                <span className="max-w-full text-[11px] font-semibold leading-tight text-slate-800">{candidate.name}</span>
                                                                {index === 0 && candidate.votes_count > 0 && (
                                                                    <span className="mt-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">Leading</span>
                                                                )}
                                                                <span className="mt-1 block max-w-full truncate text-[9px] text-slate-500">{candidate.party}</span>
                                                                <span className="mt-0.5 text-[10px] font-bold tabular-nums text-slate-700">{candidate.votes_count} votes</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
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

