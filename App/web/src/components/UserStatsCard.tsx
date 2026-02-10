'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, PackageCheck, Zap, Clock } from 'lucide-react';

interface UserStatsProps {
    userId: string;
}

export function UserStatsCard({ userId }: UserStatsProps) {
    const [stats, setStats] = useState({
        totalMovements: 0,
        lastActivity: '',
        avgUnits: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserStats = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('movements')
                .select('quantity, timestamp')
                .eq('operator_id', userId);

            if (data && data.length > 0) {
                const totalMovements = data.length;
                const lastActivity = data[0].timestamp; // Already ordered descending in current implementation?
                const avgUnits = data.reduce((acc, curr) => acc + curr.quantity, 0) / totalMovements;

                setStats({
                    totalMovements,
                    lastActivity,
                    avgUnits: Math.round(avgUnits * 10) / 10
                });
            }
            setLoading(false);
        };

        if (userId) fetchUserStats();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex gap-4 p-4 bg-slate-800/20 border border-slate-800 rounded-xl animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-10 w-24 bg-slate-800 rounded-lg" />)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/40 border border-slate-800/50 rounded-xl">
            <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-500">
                    <Zap size={10} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Ops</span>
                </div>
                <p className="text-xl font-black text-white">{stats.totalMovements}</p>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-500">
                    <PackageCheck size={10} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Avg Units</span>
                </div>
                <p className="text-xl font-black text-white">{stats.avgUnits}</p>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-500">
                    <Clock size={10} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Last Active</span>
                </div>
                <p className="text-[10px] font-bold text-slate-300">
                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-[10px] text-slate-500">
                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
            </div>
        </div>
    );
}
