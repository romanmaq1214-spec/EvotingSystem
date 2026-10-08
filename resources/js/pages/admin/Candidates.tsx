import React, { useEffect, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { UserCheck, Plus, Edit2, Trash2, X, Award, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface Candidate {
    id: number;
    election_id: number;
    position_id: number;
    student_id: number | null;
    name: string;
    party: string;
    photo: string | null;
    platform: string | null;
    status: 'active' | 'inactive';
    votes_count: number;
    position?: { id: number; name: string };
    election?: { id: number; title: string };
    student?: { id: number; student_id: string; first_name: string; last_name: string };
}

interface Position {
    id: number;
    name: string;
}

interface Election {
    id: number;
    title: string;
    status: string;
}

interface Student {
    id: number;
    student_id: string;
    first_name: string;
    last_name: string;
}

interface Props {
    candidates: {
        data: Candidate[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    elections: Election[];
    positions: Position[];
    students: Student[];
    filters: {
        election_id?: number;
        position_id?: number;
    };
}

export default function Candidates({
    candidates,
    elections,
    positions,
    students,
    filters,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm<{
        election_id: number | string;
        position_id: number | string;
        student_id: number | string;
        name: string;
        party: string;
        platform: string;
        status: 'active' | 'inactive';
        photo: File | null;
    }>({
        election_id: filters.election_id || (elections[0]?.id ?? ''),
        position_id: positions[0]?.id ?? '',
        student_id: '',
        name: '',
        party: '',
        platform: '',
        status: 'active',
        photo: null,
    });

    useEffect(() => {
        if (!data.photo) return;

        const previewUrl = URL.createObjectURL(data.photo);
        setPhotoPreview(previewUrl);
        return () => URL.revokeObjectURL(previewUrl);
    }, [data.photo]);

    const openCreateModal = () => {
        setEditingCandidate(null);
        setPhotoPreview(null);
        reset();
        setData({
            election_id: filters.election_id || (elections[0]?.id ?? ''),
            position_id: positions[0]?.id ?? '',
            student_id: '',
            name: '',
            party: '',
            platform: '',
            status: 'active',
            photo: null,
        });
        setModalOpen(true);
    };

    const openEditModal = (c: Candidate) => {
        setEditingCandidate(c);
        setPhotoPreview(c.photo);
        setData({
            election_id: c.election_id,
            position_id: c.position_id,
            student_id: c.student_id || '',
            name: c.name,
            party: c.party,
            platform: c.platform || '',
            status: c.status,
            photo: null,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCandidate) {
            post(`/admin/candidates/${editingCandidate.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post('/admin/candidates', {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (c: Candidate) => {
        if (confirm(`Are you sure you want to delete candidate "${c.name}"?`)) {
            router.delete(`/admin/candidates/${c.id}`);
        }
    };

    return (
        <AdminLayout title="Candidate Management">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <p className="text-xs text-slate-500">
                        Manage registered candidates, position assignments, party affiliations, and election platforms.
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add New Candidate</span>
                    </button>
                </div>

                {/* Candidates shown as a simple list with horizontal dividers. */}
                <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
                    {candidates.data.map((candidate) => (
                        <div
                            key={candidate.id}
                            className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-4">
                                {/* Photo or Initials Avatar */}
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 font-bold text-indigo-600 ring-1 ring-indigo-500/20">
                                        {candidate.photo ? (
                                            <img
                                                src={candidate.photo}
                                                alt={candidate.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg">
                                                {candidate.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                            </span>
                                        )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate font-bold text-slate-900">{candidate.name}</h3>
                                    <div className="text-xs font-semibold text-indigo-600">{candidate.party}</div>
                                    <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                                        <Award className="h-3 w-3" />
                                        <span>{candidate.position?.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 sm:justify-end">
                                <span>Status: <strong className={candidate.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}>{candidate.status}</strong></span>
                                <span>Votes: <strong className="text-indigo-600">{candidate.votes_count}</strong></span>
                                {candidate.election?.title && (
                                    <span className="max-w-56 truncate text-[10px] text-slate-400">{candidate.election.title}</span>
                                )}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(candidate)}
                                        aria-label={`Edit ${candidate.name}`}
                                        className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(candidate)}
                                        aria-label={`Delete ${candidate.name}`}
                                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {candidates.data.length === 0 && (
                    <div className="border-b border-slate-200 bg-white py-12 text-center text-xs text-slate-400">
                        No candidates registered yet.
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-base font-bold text-slate-900">
                                {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700">Election *</label>
                                    <select
                                        value={data.election_id}
                                        onChange={(e) => setData('election_id', Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    >
                                        {elections.map((el) => (
                                            <option key={el.id} value={el.id}>{el.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700">Position *</label>
                                    <select
                                        value={data.position_id}
                                        onChange={(e) => setData('position_id', Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    >
                                        {positions.map((pos) => (
                                            <option key={pos.id} value={pos.id}>{pos.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700">Candidate Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Alexander Vance"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700">Party Affiliation *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Leaders of Tomorrow"
                                        value={data.party}
                                        onChange={(e) => setData('party', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700">Platform / Manifesto</label>
                                <textarea
                                    rows={3}
                                    placeholder="Enter candidate's key promises, goals, and platform points..."
                                    value={data.platform}
                                    onChange={(e) => setData('platform', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700">Candidate Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                        className="mt-1 w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-2 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-400">Choose an image (max 2 MB). Image is optional.</p>
                                    {photoPreview && (
                                        <div className="mt-3 flex items-center gap-3">
                                            <img src={photoPreview} alt="Candidate preview" className="h-12 w-12 rounded-full border border-slate-200 object-cover" />
                                            <span className="text-[11px] text-slate-500">
                                                {data.photo?.name || 'Current candidate image'}
                                            </span>
                                            {data.photo && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setData('photo', null);
                                                        setPhotoPreview(editingCandidate?.photo || null);
                                                    }}
                                                    className="ml-auto text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                                                >
                                                    Remove new image
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as any)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
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
                                    {processing ? 'Saving...' : editingCandidate ? 'Update Candidate' : 'Add Candidate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
