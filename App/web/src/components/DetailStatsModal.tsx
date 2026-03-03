'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Target, Zap, Clock, Box, ShieldCheck, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export type DetailType = 'KPI_TOTAL_SKUS' | 'KPI_MOVEMENTS' | 'KPI_CRITICAL' | 'KPI_LOAD' | 'ZONE_DETAIL';

interface DetailStatsModalProps {
    type: DetailType | null;
    title: string;
    onClose: () => void;
    data?: any; // Keeping for generic props, but could be typed if needed
}

export function DetailStatsModal({ type, title, onClose, data }: DetailStatsModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (type) setIsVisible(true);
        else setIsVisible(false);
    }, [type]);

    if (!type) return null;

    // Simulation of detailed data based on type
    const renderContent = () => {
        if (!data) return (
            <div className="flex items-center justify-center h-48">
                <p className="text-slate-500 text-xs font-black uppercase animate-pulse">Synchronizing Neural Grid...</p>
            </div>
        );

        switch (type) {
            case 'KPI_TOTAL_SKUS':
                const maxCount = data.topCategories?.[0]?.count || 1;
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Density</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <TrendingUp className="text-emerald-500" size={16} />
                                    <span className="text-xl font-black text-white">{data.totalProducts} Units</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Categories</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Box className="text-blue-500" size={16} />
                                    <span className="text-xl font-black text-white">{data.activeCategories} Groups</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">Top Volume Categories</h4>
                            {data.topCategories?.map((cat: { name: string; count: number }, i: number) => {
                                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
                                return (
                                    <div key={cat.name} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">{cat.name}</span>
                                            <span className="text-white">{cat.count.toLocaleString()} units</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(cat.count / maxCount) * 100}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-full ${colors[i % colors.length]}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'KPI_MOVEMENTS':
                const maxHourCount = Math.max(...(data.hourlyActivity?.map((h: any) => h.count) || [1]));
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                            <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Telemetry Window (12H)</p>
                                <p className="text-xl font-black text-white mt-1">{data.movements24h} Movements Recorded</p>
                            </div>
                            <Clock className="text-blue-500" size={32} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Efficiency', val: '94%', sub: 'vs 88% avg' },
                                { label: 'Errors', val: '0.2%', sub: 'Critical low' },
                                { label: 'Speed', val: '42s', sub: 'Per pick' },
                            ].map(item => (
                                <div key={item.label} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-lg font-black text-white mt-1">{item.val}</p>
                                    <p className="text-[8px] font-bold text-slate-600 uppercase mt-0.5">{item.sub}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative h-32 flex items-end justify-between px-8">
                            {data.hourlyActivity?.map((h: { hour: number; count: number }, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(h.count / maxHourCount) * 100}%` }}
                                    className="w-2 bg-blue-500/40 rounded-t-sm hover:bg-blue-500 transition-colors"
                                    title={`Hour ${h.hour}: ${h.count} movements`}
                                />
                            ))}
                            <div className="absolute top-4 left-6">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Activity Waveform</p>
                            </div>
                        </div>
                    </div>
                );
            case 'KPI_CRITICAL':
                return (
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center gap-4">
                            <AlertCircle className="text-red-500 animate-pulse" size={24} />
                            <div>
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Action Required</p>
                                <p className="text-sm font-bold text-white">{data.criticalItems} Items below safety threshold</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {data.criticalItemsList?.map((item: { sku_qr: string; name: string; stock_actual: number; stock_minimo: number }) => (
                                <div key={item.sku_qr} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between group hover:border-red-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-[8px] font-black text-red-500 border border-red-500/20">
                                            LOW
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase">{item.name}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{item.sku_qr}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-red-400">{item.stock_actual} / {item.stock_minimo}</p>
                                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Units Left</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'KPI_LOAD':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                    <motion.circle
                                        cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                                        strokeDasharray={440}
                                        initial={{ strokeDashoffset: 440 }}
                                        animate={{ strokeDashoffset: 440 - (440 * (data.storageCapacity / 100)) }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        className="text-emerald-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-white">{data.storageCapacity}%</span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Occupancy</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {data.loadByZone?.map((item: any) => (
                                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                                    <span className="text-xs font-bold text-white uppercase tracking-widest">{item.label}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-500">{item.usage}</span>
                                        <div className={`w-2 h-2 rounded-full ${item.status === 'Critical' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'ZONE_DETAIL':
                return (
                    <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Sector Metrics: {data?.name}</h4>
                            <p className="text-sm text-slate-300">Detailed spatial audit for section {data?.id}. 24 items located in this area.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temperature</p>
                                <p className="text-xl font-black text-white mt-1">18.4°C</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Light Lux</p>
                                <p className="text-xl font-black text-white mt-1">450 lm</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">Storage Map</h5>
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className={`aspect-square rounded-lg border ${i === 3 ? 'bg-red-500/20 border-red-500/40 animate-pulse' : 'bg-slate-800/50 border-slate-700'}`} />
                                ))}
                            </div>
                            <p className="text-center text-[10px] text-slate-600 font-bold uppercase mt-2">Rack Representation Logic Active</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {type && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-200 flex items-center justify-end p-6"
                >
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className="w-full max-w-lg h-full bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative"
                    >
                        {/* Closing Line Decorative */}
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-0.5 h-32 bg-blue-500/20 rounded-full" />

                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] leading-none mb-1">Neural Telemetry</p>
                                    <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95 group border border-white/5"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {renderContent()}
                        </div>

                        <div className="p-8 bg-slate-950/50 border-t border-white/5 flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Zap size={14} className="text-blue-500" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Live Stream Data • Latency 14ms</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all"
                            >
                                Dismiss System Logs
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
