import React, { useEffect, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import ImageCropDialog from '@/components/ImageCropDialog';
import { Crop as CropIcon, Plus, Edit2, Trash2, X } from 'lucide-react';

interface Candidate {
    id: number;
    election_id: number;
    position_id: number;
    student_id: number | null;
    name: string;
    party: string;
    photo: string | null;
    original_photo: string | null;
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
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [pendingOriginalPhoto, setPendingOriginalPhoto] = useState<File | null>(null);
    const [loadingCurrentPhoto, setLoadingCurrentPhoto] = useState(false);
    const [photoError, setPhotoError] = useState('');
    const detailsDialogRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, reset, errors } = useForm<{
        election_id: number | string;
        position_id: number | string;
        student_id: number | string;
        name: string;
        party: string;
        platform: string;
        status: 'active' | 'inactive';
        photo: File | null;
        original_photo: File | null;
    }>({
        election_id: filters.election_id || (elections[0]?.id ?? ''),
        position_id: positions[0]?.id ?? '',
        student_id: '',
        name: '',
        party: '',
        platform: '',
        status: 'active',
        photo: null,
        original_photo: null,
    });

    useEffect(() => {
        if (!data.photo) return;

        const previewUrl = URL.createObjectURL(data.photo);
        setPhotoPreview(previewUrl);
        return () => URL.revokeObjectURL(previewUrl);
    }, [data.photo]);

    useEffect(() => {
        if (!selectedCandidate) return;

        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSelectedCandidate(null);
        };

        detailsDialogRef.current?.focus();
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            previousFocus?.focus();
        };
    }, [selectedCandidate]);

    const partyGroups = Object.entries(
        candidates.data.reduce<Record<string, Candidate[]>>((groups, candidate) => {
            const party = candidate.party.trim() || 'No Party Affiliation';
            (groups[party] ??= []).push(candidate);
            return groups;
        }, {}),
    )
        .sort(([partyA], [partyB]) => partyA.localeCompare(partyB))
        .map(([party, partyCandidates]) => [
            party,
            partyCandidates.sort((candidateA, candidateB) => candidateA.name.localeCompare(candidateB.name)),
        ] as const);

    const openCreateModal = () => {
        setEditingCandidate(null);
        setPhotoPreview(null);
        setPendingOriginalPhoto(null);
        setPhotoError('');
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
            original_photo: null,
        });
        setModalOpen(true);
    };

    const openEditModal = (c: Candidate) => {
        setEditingCandidate(c);
        setPhotoPreview(c.photo);
        setPendingOriginalPhoto(null);
        setPhotoError('');
        setData({
            election_id: c.election_id,
            position_id: c.position_id,
            student_id: c.student_id || '',
            name: c.name,
            party: c.party,
            platform: c.platform || '',
            status: c.status,
            photo: null,
            original_photo: null,
        });
        setModalOpen(true);
    };

    const cropCurrentPhoto = async () => {
        if (!editingCandidate?.photo) return;

        setLoadingCurrentPhoto(true);
        setPhotoError('');

        try {
            const response = await fetch(editingCandidate.original_photo || editingCandidate.photo);
            if (!response.ok) throw new Error('Image request failed');

            const blob = await response.blob();
            const fileType = blob.type || 'image/png';
            const extension = fileType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
            const originalFile = new File([blob], `candidate-original.${extension}`, { type: fileType });
            setPendingOriginalPhoto(originalFile);
            setCropFile(originalFile);
        } catch {
            setPhotoError('Could not load the saved image for cropping. Try choosing the image again.');
        } finally {
            setLoadingCurrentPhoto(false);
        }
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

                {/* Candidates are grouped by party and open a full detail dialog when selected. */}
                <div className="space-y-8">
                    {partyGroups.map(([party, partyCandidates]) => (
                        <section key={party}>
                            <div className="mb-4 flex items-center gap-3">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">{party}</h2>
                                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                                    {partyCandidates.length} {partyCandidates.length === 1 ? 'candidate' : 'candidates'}
                                </span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {partyCandidates.map((candidate) => (
                                    <article
                                        key={candidate.id}
                                        className="group relative aspect-square w-full max-w-44 justify-self-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-indigo-500"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCandidate(candidate)}
                                            aria-label={`View full details for ${candidate.name}`}
                                            className="absolute inset-0 z-0 block w-full rounded-full text-left outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-violet-100 text-indigo-600">
                                                {candidate.photo ? (
                                                    <img
                                                        src={candidate.photo}
                                                        alt={candidate.name}
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <span className="text-4xl font-bold tracking-wide sm:text-5xl">
                                                        {candidate.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent px-3 pb-6 pt-14 text-center transition-opacity group-hover:opacity-0 group-focus-within:opacity-0">
                                                <h3 className="truncate text-sm font-bold text-white">{candidate.name}</h3>
                                            </div>
                                            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-indigo-950/25 p-4 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">{candidate.party}</p>
                                                <h3 className="mt-1 line-clamp-2 text-base font-bold text-white">{candidate.position?.name || 'Unassigned'}</h3>
                                                <p className="mt-2 line-clamp-2 text-sm text-white/90">{candidate.name}</p>
                                            </div>
                                        </button>
                                        <div className="pointer-events-none absolute right-5 top-5 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(candidate)}
                                                aria-label={`Edit ${candidate.name}`}
                                                className="rounded-lg bg-white/90 p-2 text-slate-600 shadow-sm transition hover:bg-white hover:text-indigo-600"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(candidate)}
                                                aria-label={`Delete ${candidate.name}`}
                                                className="rounded-lg bg-white/90 p-2 text-slate-600 shadow-sm transition hover:bg-white hover:text-rose-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {candidates.data.length === 0 && (
                    <div className="border border-dashed border-slate-200 bg-white py-12 text-center text-xs text-slate-400">
                        No candidates registered yet.
                    </div>
                )}
            </div>

            {selectedCandidate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedCandidate(null)}
                >
                    <div
                        ref={detailsDialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="candidate-details-title"
                        tabIndex={-1}
                        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/30 bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="relative flex items-center gap-4 bg-gradient-to-r from-indigo-700 to-violet-700 p-6 text-white sm:p-8">
                            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/30 bg-white/15 text-2xl font-bold text-white">
                                {selectedCandidate.photo ? (
                                    <img src={selectedCandidate.photo} alt={selectedCandidate.name} className="h-full w-full object-cover" />
                                ) : (
                                    selectedCandidate.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">{selectedCandidate.party}</p>
                                <h2 id="candidate-details-title" className="mt-1 text-xl font-bold sm:text-2xl">{selectedCandidate.name}</h2>
                                <p className="mt-1 text-sm text-white/85">{selectedCandidate.position?.name || 'Position unassigned'}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedCandidate(null)}
                                aria-label="Close candidate details"
                                className="absolute right-3 top-3 rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-5 p-6 sm:p-8">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Party affiliation</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCandidate.party}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Position</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCandidate.position?.name || 'Unassigned'}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Election</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCandidate.election?.title || 'Not specified'}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status and votes</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        <span className={selectedCandidate.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}>{selectedCandidate.status}</span>
                                        <span className="mx-2 text-slate-300">|</span>
                                        {selectedCandidate.votes_count} {selectedCandidate.votes_count === 1 ? 'vote' : 'votes'}
                                    </p>
                                </div>
                                {selectedCandidate.student && (
                                    <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Linked student</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {selectedCandidate.student.first_name} {selectedCandidate.student.last_name}
                                            <span className="ml-2 font-normal text-slate-500">({selectedCandidate.student.student_id})</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform / Manifesto</h3>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                    {selectedCandidate.platform || 'No platform or manifesto provided.'}
                                </p>
                            </div>
                            <div className="flex justify-end border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCandidate(null)}
                                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                        onChange={(e) => {
                                            const file = e.currentTarget.files?.[0] || null;
                                            e.currentTarget.value = '';
                                            if (file) {
                                                setPhotoError('');
                                                setPendingOriginalPhoto(file);
                                                setCropFile(file);
                                            }
                                        }}
                                        className="mt-1 w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-2 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-400">Choose an image, then crop it before saving. The final image must be 2 MB or less.</p>
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
                                                        const original = data.original_photo || data.photo;
                                                        if (original) {
                                                            setPendingOriginalPhoto(original);
                                                            setCropFile(original);
                                                        }
                                                    }}
                                                    className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                                                >
                                                    <CropIcon className="h-3.5 w-3.5" />
                                                    Crop again
                                                </button>
                                            )}
                                            {data.photo && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setData('photo', null);
                                                        setPhotoPreview(editingCandidate?.photo || null);
                                                    }}
                                                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                            {editingCandidate?.photo && !data.photo && (
                                                <button
                                                    type="button"
                                                    onClick={cropCurrentPhoto}
                                                    disabled={loadingCurrentPhoto}
                                                    className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                                                >
                                                    <CropIcon className="h-3.5 w-3.5" />
                                                    {loadingCurrentPhoto ? 'Opening...' : 'Crop / Edit'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {photoError && <p role="alert" className="mt-2 text-[11px] font-medium text-rose-600">{photoError}</p>}
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

            {cropFile && (
                <ImageCropDialog
                    file={cropFile}
                    onCancel={() => {
                        setCropFile(null);
                        setPendingOriginalPhoto(null);
                    }}
                    onApply={(croppedFile) => {
                        setData('photo', croppedFile);
                        if (pendingOriginalPhoto) setData('original_photo', pendingOriginalPhoto);
                        setPendingOriginalPhoto(null);
                        setCropFile(null);
                    }}
                />
            )}
        </AdminLayout>
    );
}
