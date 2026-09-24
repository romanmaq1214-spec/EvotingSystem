import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Vote, LogOut, CheckCircle, User, Award, ArrowLeft } from 'lucide-react';

interface Props {
    title: string;
    children: React.ReactNode;
    showBackToDashboard?: boolean;
}

export default function StudentLayout({ title, children, showBackToDashboard = false }: Props) {
    const { auth, flash } = usePage<any>().props;

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white font-sans text-slate-800">
            <Head title={`${title} | School E-Voting System`} />

            {/* Navbar */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                            <Vote className="h-6 w-6" />
                        </div>
                        <div>
                            <Link href="/student/dashboard" className="text-lg font-bold tracking-tight text-slate-900 hover:text-blue-600">
                                EVotingSystem
                            </Link>
                            <span className="block text-[11px] font-medium text-slate-500">
                                School E-Voting Portal
                            </span>
                        </div>
                    </div>

                    {/* Student Info & Actions */}
                    <div className="flex items-center space-x-4">
                        {showBackToDashboard && (
                            <Link
                                href="/student/dashboard"
                                className="hidden items-center space-x-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 sm:flex"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Dashboard</span>
                            </Link>
                        )}

                        <div className="hidden text-right md:block">
                            <div className="text-xs font-semibold text-slate-900">
                                {auth?.user?.name || 'Student Voter'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                                ID: {auth?.user?.student_id || auth?.user?.student?.student_id || 'N/A'}
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Container */}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Flash Notifications */}
                {flash?.success && (
                    <div className="mb-6 flex items-center space-x-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                        <span className="font-medium">{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 flex items-center space-x-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
                        <span className="font-medium">{flash.error}</span>
                    </div>
                )}
                {flash?.info && (
                    <div className="mb-6 flex items-center space-x-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 shadow-sm">
                        <span className="font-medium">{flash.info}</span>
                    </div>
                )}

                {children}
            </main>

            {/* Footer */}
            <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
                <div className="mx-auto max-w-6xl px-4">
                    EVotingSystem — Official School Electronic Voting Platform. All votes are digitally encrypted and verified.
                </div>
            </footer>
        </div>
    );
}

