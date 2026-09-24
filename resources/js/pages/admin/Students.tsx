import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Users,
    Search,
    Plus,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    X,
    UserCheck,
    Eye,
    EyeOff,
} from 'lucide-react';

interface Student {
    id: number;
    student_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    email: string;
    course: string;
    year_level: string;
    status: 'active' | 'inactive';
    created_at: string;
}

interface Props {
    students: {
        data: Student[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Students({ students, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [showModalPassword, setShowModalPassword] = useState(false);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        student_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        password: '',
        course: 'BS Information Technology',
        year_level: '1st Year',
        status: 'active',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/students', { search: searchTerm, status: statusFilter }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingStudent(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setData({
            student_id: student.student_id,
            first_name: student.first_name,
            middle_name: student.middle_name || '',
            last_name: student.last_name,
            email: student.email,
            password: '',
            course: student.course,
            year_level: student.year_level,
            status: student.status,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStudent) {
            put(`/admin/students/${editingStudent.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post('/admin/students', {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleToggleStatus = (student: Student) => {
        router.patch(`/admin/students/${student.id}/toggle-status`);
    };

    const handleDelete = (student: Student) => {
        if (confirm(`Are you sure you want to delete student ${student.student_id} (${student.first_name} ${student.last_name})?`)) {
            router.delete(`/admin/students/${student.id}`);
        }
    };

    return (
        <AdminLayout title="Student Management">
            <div className="space-y-6">
                {/* Actions & Filters Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center space-x-3">
                        <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by student ID, name, email, course..."
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add New Student</span>
                    </button>
                </div>

                {/* Students Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-3.5">Student ID</th>
                                <th className="px-6 py-3.5">Full Name</th>
                                <th className="px-6 py-3.5">Username</th>
                                <th className="px-6 py-3.5">Course & Year</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.data.length > 0 ? (
                                students.data.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50/60">
                                        <td className="px-6 py-4 font-mono font-semibold text-indigo-600">
                                            {student.student_id}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {student.first_name} {student.middle_name ? `${student.middle_name} ` : ''}{student.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div>{student.course}</div>
                                            <span className="text-[10px] text-slate-400">{student.year_level}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(student)}
                                                className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                                    student.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                                        : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                                                }`}
                                            >
                                                {student.status === 'active' ? (
                                                    <>
                                                        <CheckCircle className="h-3 w-3" />
                                                        <span>Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        <span>Inactive</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => openEditModal(student)}
                                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                                                    title="Edit student"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student)}
                                                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                    title="Delete student"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                                        No students found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {students.links && students.links.length > 3 && (
                    <div className="flex justify-center space-x-1">
                        {students.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                    link.active
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                } disabled:opacity-40`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Create / Edit Student */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-base font-bold text-slate-900">
                                {editingStudent ? 'Edit Student' : 'Add New Student'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700">Student ID *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 2026-0001"
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    />
                                    {errors.student_id && <p className="text-rose-500">{errors.student_id}</p>}
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

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700">Middle Name</label>
                                    <input
                                        type="text"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700">Username *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. romanmaq0123 or student123"
                                        value={data.username || data.email}
                                        onChange={(e) => {
                                            setData('username' as any, e.target.value);
                                            setData('email', e.target.value);
                                        }}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    />
                                    {errors.username && <p className="text-rose-500">{errors.username}</p>}
                                    {errors.email && <p className="text-rose-500">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700">
                                        Password {editingStudent ? '(Leave blank to keep)' : '*'}
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showModalPassword ? 'text' : 'password'}
                                            required={!editingStudent}
                                            placeholder="Set account password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 p-2.5 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowModalPassword(!showModalPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                                            title={showModalPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showModalPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl bg-indigo-50/70 p-2.5 text-[11px] text-indigo-700 border border-indigo-100">
                                💡 <strong>Account Credentials:</strong> The <strong>Username</strong> (or Student ID) and <strong>Password</strong> set here will be the exact login credentials provided by the admin for the student to sign in and vote.
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700">Course *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.course}
                                        onChange={(e) => setData('course', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700">Year Level *</label>
                                    <select
                                        value={data.year_level}
                                        onChange={(e) => setData('year_level', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                                    >
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
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
                                    {processing ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

