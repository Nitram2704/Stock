'use client';

import { useState, useCallback, useEffect } from 'react';
import { KPICard } from '@/components/KPICard';
import { RealTimeScanList } from '@/components/RealTimeScanList';
import { WarehouseMap } from '@/components/WarehouseMap';
import { QRScanner } from '@/components/QRScanner';
import { DetailStatsModal, DetailType } from '@/components/DetailStatsModal';
import { Box, Activity, AlertTriangle, PackageCheck, Scan, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardStats {
    totalProducts: number;
    movements24h: number;
    criticalItems: number;
    storageCapacity: number;
    currentStock: number;
}

interface Notification {
    message: string;
    type: 'success' | 'error';
    id: number;
}

export default function DashboardPage() {
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [activeDetail, setActiveDetail] = useState<{ type: DetailType; title: string; data?: any } | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [notification, setNotification] = useState<Notification | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/v1/inventory/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Poll every 5s for the demo
        return () => clearInterval(interval);
    }, [fetchStats]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setNotification({ message, type, id });
        setTimeout(() => {
            setNotification(prev => prev?.id === id ? null : prev);
        }, 4000);
    };

    const handleScan = useCallback(async (sku: string) => {
        try {
            const response = await fetch('http://localhost:3001/api/v1/inventory/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sku_qr: sku,
                    type: 'IN',
                    quantity: 1,
                    operator_id: null
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Scan rejected');
            }

            showNotification(`Entry Recorded: ${sku}`, 'success');
            fetchStats();
        } catch (error: any) {
            showNotification(error.message || 'Scan Failed', 'error');
            throw error; // Re-throw for QRScanner to show its internal error state
        }
    }, [fetchStats]);

    return (
        <div className="flex-1 relative">
            {/* Notification System */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, x: '-50%', opacity: 0 }}
                        animate={{ y: 20, x: '-50%', opacity: 1 }}
                        exit={{ y: -100, x: '-50%', opacity: 0 }}
                        className={`fixed top-0 left-1/2 z-300 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${notification.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span className="text-xs font-black uppercase tracking-widest">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white uppercase">Neural Logistics Center</h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Synchronized warehouse telemetry and autonomous inventory auditing.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="px-6 py-2.5 bg-white hover:bg-blue-600 text-slate-950 hover:text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/5 active:scale-95 flex items-center gap-2 border border-white/10"
                    >
                        <Scan size={14} />
                        Manual Scan
                    </button>
                    <div className="px-4 py-2 rounded-xl bg-slate-950 border border-white/5 text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        Optic Grid Online
                    </div>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    label="Stock Density"
                    value={stats?.totalProducts.toLocaleString() || '---'}
                    trend="+2.5%"
                    icon={Box}
                    onClick={() => setActiveDetail({ type: 'KPI_TOTAL_SKUS', title: 'Stock Density Catalog', data: stats })}
                />
                <KPICard
                    label="Flow Rate (24H)"
                    value={stats?.movements24h.toLocaleString() || '---'}
                    trend="+12%"
                    icon={Activity}
                    onClick={() => setActiveDetail({ type: 'KPI_MOVEMENTS', title: 'Movement Throughput', data: stats })}
                />
                <KPICard
                    label="Depletion Alerts"
                    value={stats?.criticalItems.toLocaleString() || '---'}
                    icon={AlertTriangle}
                    variant={stats && stats.criticalItems > 0 ? 'alert' : 'default'}
                    onClick={() => setActiveDetail({ type: 'KPI_CRITICAL', title: 'Critical Depletion Logs', data: stats })}
                />
                <KPICard
                    label="Storage Capacity"
                    value={`${stats?.storageCapacity || 0}%`}
                    icon={PackageCheck}
                    variant="success"
                    onClick={() => setActiveDetail({ type: 'KPI_LOAD', title: 'Volumetric Load Analysis', data: stats })}
                />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 space-y-8 min-h-[500px]">
                    <WarehouseMap onZoneClick={(zone) => setActiveDetail({ type: 'ZONE_DETAIL', title: `Sector ${zone.id} Telemetry`, data: zone })} />
                </div>

                <div className="lg:col-span-1">
                    <div className="min-h-[500px]">
                        <RealTimeScanList />
                    </div>
                </div>
            </div>

            <QRScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />

            <DetailStatsModal
                type={activeDetail?.type || null}
                title={activeDetail?.title || ''}
                data={activeDetail?.data}
                onClose={() => setActiveDetail(null)}
            />
        </div>
    );
}
