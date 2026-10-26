import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Award, Plus, Edit2, Trash2, X, Users, Vote } from 'lucide-react';

interface Position {
    id: number;
    election_id: number;
    name: string;
    description: string | null;
    max_votes: number;
    candidates_count: number;
    election: {
        id: number;
        title: string;
    };
}

interface Props {
    positions: Position[];
    elections: Array<{ id: number; title: string; status: string }>;
    selected_election_id: number | null;
}

export default function Positions({ positions, elections, selected_election_id }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        election_id: selected_election_id || (elections[0]?.id ?? ''),
        name: '',
        description: '',
        max_votes: 1,
    });

    const handleElectionChange = (electionId: number) => {
        router.get('/admin/positions', { election_id: electionId }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingPosition(null);
        reset();
        setData({
            election_id: selected_election_id || (elections[0]?.id ?? ''),
            name: '',
            description: '',
            max_votes: 1,
        });
        setModalOpen(true);
    };

    const openEditModal = (pos: Position) => {
        setEditingPosition(pos);
        setData({
            election_id: pos.election_id,
            name: pos.name,
            description: pos.description || '',
            max_votes: pos.max_votes,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPosition) {
            put(`/admin/positions/${editingPosition.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post('/admin/positions', {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (pos: Position) => {
        if (confirm(`Delete position "${pos.name}"? All assigned candidates will also be deleted.`)) {
            router.delete(`/admin/positions/${pos.id}`);
        }
    };

    return (
        <AdminLayout title="Position Management">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
                    {/* Election Selector */}
                    <div className="w-full sm:max-w-xl">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Show positions for election</label>
                        <select
                            value={selected_election_id || ''}
                            onChange={(e) => handleElectionChange(Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            {elections.map((el) => (
                                <option key={el.id} value={el.id}>
                                    {el.title} ({el.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex shrink-0 items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add New Position</span>
                    </button>
                </div>

                {/* Keep positions in a readable line layout with clear metadata and actions. */}
                <div className="space-y-3">
                    {positions.map((pos) => (
                        <div
                            key={pos.id}
                            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-5"
                        >
                            <div className="flex min-w-0 flex-1 items-start gap-4">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-semibold text-slate-900">{pos.name}</h3>
                                    <p className="mt-1 text-sm leading-5 text-slate-600">
                                        {pos.description || 'No description added for this position.'}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200">
                                            <Users className="h-3.5 w-3.5 text-indigo-600" />
                                            <strong className="text-slate-800">{pos.candidates_count}</strong> candidates
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200">
                                            <Vote className="h-3.5 w-3.5 text-emerald-600" />
                                            Up to <strong className="text-slate-800">{pos.max_votes}</strong> {pos.max_votes === 1 ? 'vote' : 'votes'} per student
                                        </span>
                                        {pos.election?.title && (
                                            <span className="inline-flex max-w-full items-center rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-700 sm:max-w-[22rem]">
                                                <span className="truncate">{pos.election.title}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 border-t border-slate-100 pt-3 sm:ml-4 sm:border-0 sm:pt-0">
                                <button
                                    onClick={() => openEditModal(pos)}
                                    aria-label={`Edit ${pos.name}`}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(pos)}
                                    aria-label={`Delete ${pos.name}`}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {positions.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
                        <Award className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">No positions for this election yet</p>
                        <p className="mt-1 text-xs text-slate-500">Add a position to start organizing the ballot.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-base font-bold text-slate-900">
                                {editingPosition ? 'Edit Position' : 'Create Position'}
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
                                <label className="font-semibold text-slate-700">Election *</label>
                                <select
                                    value={data.election_id}
                                    onChange={(e) => setData('election_id', Number(e.target.value))}
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                >
                                    {elections.map((el) => (
                                        <option key={el.id} value={el.id}>
                                            {el.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700">Position Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. President, Vice President"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                />
                                {errors.name && <p className="text-rose-500">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Duties and scope of responsibilities..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700">Max Votes Allowed</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={data.max_votes}
                                    onChange={(e) => setData('max_votes', Number(e.target.value))}
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                />
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Number of candidates a student can select for this position (default 1).
                                </p>
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
                                    {processing ? 'Saving...' : editingPosition ? 'Update Position' : 'Create Position'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
