import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Vote,
    Plus,
    Edit2,
    Trash2,
    Calendar,
    Clock,
    X,
    CheckCircle2,
    Play,
    Pause,
} from 'lucide-react';

interface Election {
    id: number;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    status: 'Draft' | 'Upcoming' | 'Open' | 'Closed';
    positions_count: number;
    candidates_count: number;
    votes_count: number;
}

interface Props {
    elections: {
        data: Election[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export default function Elections({ elections }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingElection, setEditingElection] = useState<Election | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'Draft',
    });

    const openCreateModal = () => {
        setEditingElection(null);
        reset();
        setData({
            title: '',
            description: '',
            start_date: new Date().toISOString().slice(0, 16),
            end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
            status: 'Draft',
        });
        setModalOpen(true);
    };

    const openEditModal = (election: Election) => {
        setEditingElection(election);
        setData({
            title: election.title,
            description: election.description || '',
            start_date: election.start_date.slice(0, 16),
            end_date: election.end_date.slice(0, 16),
            status: election.status,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingElection) {
            put(`/admin/elections/${editingElection.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post('/admin/elections', {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleUpdateStatus = (election: Election, newStatus: string) => {
        router.patch(`/admin/elections/${election.id}/status`, { status: newStatus });
    };

    const handleDelete = (election: Election) => {
        if (confirm(`Are you sure you want to delete "${election.title}"? This will delete all associated positions and votes.`)) {
            router.delete(`/admin/elections/${election.id}`);
        }
    };

    return (
        <AdminLayout title="Election Management">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">
                        Create and schedule student council elections, control voting status, and manage active periods.
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create New Election</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {elections.data.map((election) => (
                        <div
                            key={election.id}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >
                            <div>
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">{election.title}</h3>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            election.status === 'Open'
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                                : election.status === 'Upcoming'
                                                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                                                : election.status === 'Closed'
                                                ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                            election.status === 'Open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                        }`}></span>
                                        {election.status}
                                    </span>
                                </div>

                                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                                    {election.description || 'No description provided.'}
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600">
                                    <div className="flex items-center space-x-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Start: {new Date(election.start_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                        <span>End: {new Date(election.end_date).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center space-x-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                                    <span><strong>{election.positions_count}</strong> Positions</span>
                                    <span><strong>{election.candidates_count}</strong> Candidates</span>
                                    <span className="font-semibold text-indigo-600"><strong>{election.votes_count}</strong> Votes Cast</span>
                                </div>
                            </div>

                            {/* Status controls & Action Buttons */}
                            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                <div className="flex items-center space-x-1.5">
                                    {election.status !== 'Open' ? (
                                        <button
                                            onClick={() => handleUpdateStatus(election, 'Open')}
                                            className="inline-flex items-center space-x-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
                                        >
                                            <Play className="h-3 w-3" />
                                            <span>Open Election</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpdateStatus(election, 'Closed')}
                                            className="inline-flex items-center space-x-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500"
                                        >
                                            <Pause className="h-3 w-3" />
                                            <span>Close Election</span>
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => openEditModal(election)}
                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                                        title="Edit election"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(election)}
                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                        title="Delete election"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-base font-bold text-slate-900">
                                {editingElection ? 'Edit Election' : 'Create New Election'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700">Election Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. School Election 2026"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                />
                                {errors.title && <p className="text-rose-500">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700">Description</label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Annual general election for student body officers..."
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700">Start Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    />
                                    {errors.start_date && <p className="text-rose-500">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700">End Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    />
                                    {errors.end_date && <p className="text-rose-500">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700">Election Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as any)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                >
                                    <option value="Draft">Draft (Hidden from students)</option>
                                    <option value="Upcoming">Upcoming (Announced, voting not started)</option>
                                    <option value="Open">Open (Students can cast votes)</option>
                                    <option value="Closed">Closed (Voting concluded)</option>
                                </select>
                            </div>

                            <div className="mt-6 flex justify-end space-x-2 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : editingElection ? 'Update Election' : 'Create Election'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

