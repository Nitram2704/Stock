'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Movement {
    id: string;
    type: 'IN' | 'OUT';
    quantity: number;
    timestamp: string;
    products: { name: string };
}

export function RealTimeScanList() {
    const [movements, setMovements] = useState<Movement[]>([]);

    useEffect(() => {
        const fetchInitialMovements = async () => {
            const { data } = await supabase
                .from('movements')
                .select('*, products(name)')
                .order('timestamp', { ascending: false })
                .limit(10);
            if (data) setMovements(data as any);
        };

        fetchInitialMovements();

        const channel = supabase
            .channel('realtime_movements')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'movements' },
                async (payload) => {
                    // Fetch the product name for the new movement
                    const { data } = await supabase
                        .from('products')
                        .select('name')
                        .eq('id', payload.new.product_id)
                        .single();

                    const newMovement = { ...payload.new, products: data } as Movement;
                    setMovements((prev) => [newMovement, ...prev.slice(0, 9)]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="card-gradient rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <History size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Real-time Activity Feed</h3>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {movements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-10">
                        <History size={40} className="opacity-20" />
                        <p className="text-sm">No activity recorded today</p>
                    </div>
                ) : (
                    movements.map((move) => (
                        <div key={move.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-md ${move.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {move.type === 'IN' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{move.products?.name || 'Unknown Product'}</p>
                                    <p className="text-xs text-slate-500">{new Date(move.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${move.type === 'IN' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {move.type === 'IN' ? 'ENTRY' : 'EXIT'}
                                </span>
                                <p className="text-sm font-bold text-slate-300 mt-1">{move.quantity} Units</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
