import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ReactNode;
    color?: 'blue' | 'green' | 'amber' | 'purple' | 'indigo' | 'rose';
}

export default function StatCard({
    title,
    value,
    description,
    icon,
    color = 'blue',
}: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
    };

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
                    {description && (
                        <p className="mt-1 text-xs text-gray-500">{description}</p>
                    )}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

