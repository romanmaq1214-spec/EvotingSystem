import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Vote,
    Award,
    UserCheck,
    BarChart3,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    ChevronRight,
} from 'lucide-react';

interface Props {
    title: string;
    children: React.ReactNode;
}

export default function AdminLayout({ title, children }: Props) {
    const { auth, flash } = usePage<any>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const currentUrl = window.location.pathname;

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, exact: true },
        { name: 'Students', href: '/admin/students', icon: Users },
        { name: 'Elections', href: '/admin/elections', icon: Vote },
        { name: 'Positions', href: '/admin/positions', icon: Award },
        { name: 'Candidates', href: '/admin/candidates', icon: UserCheck },
        { name: 'Results', href: '/admin/results', icon: BarChart3 },
    ];

    const isActive = (href: string, exact = false) => {
        if (exact) return currentUrl === href;
        return currentUrl.startsWith(href);
    };

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Head title={`${title} | Admin EVotingSystem`} />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand / Logo */}
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
                    <Link href="/admin/dashboard" className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md">
                            <Vote className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="font-bold tracking-tight text-white">EVotingSystem</span>
                            <span className="block text-[10px] uppercase tracking-wider text-indigo-400">Admin Portal</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Management
                    </div>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.href, item.exact);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                        <span>{item.name}</span>
                                    </div>
                                    {active && <ChevronRight className="h-4 w-4 text-indigo-200" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Logged-in User Profile & Logout */}
                <div className="border-t border-slate-800 p-4">
                    <div className="mb-3 flex items-center space-x-3 px-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-indigo-400 ring-2 ring-indigo-500/20">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div className="flex-1 truncate">
                            <div className="truncate text-xs font-semibold text-white">
                                {auth?.user?.name || 'Administrator'}
                            </div>
                            <div className="truncate text-[11px] text-slate-400">
                                {auth?.user?.email || 'admin@school.edu'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center space-x-2 rounded-lg bg-slate-800/80 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            System Online
                        </span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {/* Flash messages */}
                    {flash?.success && (
                        <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold">Success:</span>
                                <span>{flash.success}</span>
                            </div>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold">Error:</span>
                                <span>{flash.error}</span>
                            </div>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}

