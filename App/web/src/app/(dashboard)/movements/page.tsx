'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { History, ArrowUpRight, ArrowDownLeft, Clock, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Movement {
    id: string;
    type: 'IN' | 'OUT';
    quantity: number;
    timestamp: string;
    operator_id: string;
    products: {
        name: string;
        sku_qr: string;
        category: string;
    };
}

export default function MovementsPage() {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovements = async () => {
            const { data, error } = await supabase
                .from('movements')
                .select('*, products(name, sku_qr, category)')
                .order('timestamp', { ascending: false });

            if (data) setMovements(data as any);
            setLoading(false);
        };

        fetchMovements();
    }, []);

    return (
        <div className="flex-1">
            <header className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <History size={24} />
                    </div>
                    <h1 className="text-3xl font-bold">Movement Logs</h1>
                </div>
                <p className="text-slate-400 mt-1">Audit trail of all IoT scans and manual stock adjustments.</p>
            </header>

            <div className="card-gradient rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-800/20">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Product / SKU</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Quantity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Operator</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {movements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-600 italic">
                                        {loading ? 'Retrieving audit logs...' : 'No movements recorded yet.'}
                                    </td>
                                </tr>
                            ) : movements.map((m) => (
                                <tr key={m.id} className="hover:bg-blue-500/2 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                                            <Clock size={12} />
                                            {format(new Date(m.timestamp), 'MMM dd, HH:mm:ss')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-slate-200">{m.products?.name}</p>
                                            <p className="text-[10px] font-mono text-blue-400 uppercase">{m.products?.sku_qr}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border w-fit ${m.type === 'IN' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' :
                                            'bg-blue-500/5 text-blue-500 border-blue-500/20'
                                            }`}>
                                            {m.type === 'IN' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                            {m.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-white font-bold">{m.quantity}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                                                <UserIcon size={12} />
                                            </div>
                                            <span className="text-xs uppercase font-bold tracking-tighter">
                                                {m.operator_id ? m.operator_id.split('-')[0] : 'SYSTEM'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
