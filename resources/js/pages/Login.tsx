import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Vote, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
    status?: string;
    error?: string;
}

export default function Login({ status, error }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
            <Head title="Login | E-Voting System" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo & Header */}
                <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/20">
                        <Vote className="h-8 w-8" />
                    </div>
                </div>
                <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    EVotingSystem
                </h2>
                <p className="mt-1 text-center text-sm font-medium text-slate-400">
                    CPSU – Moises Padilla • E-Voting System
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="rounded-2xl border border-slate-800 bg-slate-800/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                    {/* Status Alert */}
                    {status && (
                        <div className="mb-5 flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                            <span>{status}</span>
                        </div>
                    )}

                    {/* Server Error Alert */}
                    {(error || errors.login) && (
                        <div className="mb-5 flex items-center space-x-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
                            <span>{error || errors.login}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Student ID / Username */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                Student ID / Username
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <User className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    required
                                    autoFocus
                                    placeholder="Enter Student ID / Username (or Email)"
                                    className="block w-full rounded-xl border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                Password
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="block w-full rounded-xl border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-rose-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 text-xs text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20"
                                />
                                <span>Remember my session</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Authenticating...' : 'Sign In to Vote'}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Protected by encrypted voting verification
                </p>
            </div>
        </div>
    );
}

