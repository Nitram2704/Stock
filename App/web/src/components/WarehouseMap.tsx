'use client';

import { motion } from 'framer-motion';
import { MousePointer2, Info } from 'lucide-react';
import { useState } from 'react';

type ZoneStatus = 'Optimal' | 'Warning' | 'Critical';

interface Zone {
    id: string;
    name: string;
    status: ZoneStatus;
    path: string;
}

interface WarehouseMapProps {
    onZoneClick?: (zone: Zone) => void;
}

export function WarehouseMap({ onZoneClick }: WarehouseMapProps) {
    const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);

    const zones: Zone[] = [
        { id: 'Z1', name: 'Rack A-01', status: 'Optimal', path: 'M 50,50 L 150,50 L 150,150 L 50,150 Z' },
        { id: 'Z2', name: 'Rack A-02', status: 'Optimal', path: 'M 170,50 L 270,50 L 270,150 L 170,150 Z' },
        { id: 'Z3', name: 'Rack B-01', status: 'Warning', path: 'M 50,170 L 150,170 L 150,270 L 50,270 Z' },
        { id: 'Z4', name: 'Rack B-02', status: 'Optimal', path: 'M 170,170 L 270,170 L 270,270 L 170,270 Z' },
        { id: 'Z5', name: 'Receiving Area', status: 'Critical', path: 'M 300,50 L 450,50 L 450,270 L 300,270 Z' },
    ];

    const getStatusColor = (status: ZoneStatus, isHovered: boolean) => {
        switch (status) {
            case 'Optimal': return isHovered ? '#10b981' : 'rgba(16, 185, 129, 0.2)';
            case 'Warning': return isHovered ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)';
            case 'Critical': return isHovered ? '#ef4444' : 'rgba(239, 68, 68, 0.2)';
        }
    };

    const getStatusBorder = (status: ZoneStatus) => {
        switch (status) {
            case 'Optimal': return '#10b981';
            case 'Warning': return '#f59e0b';
            case 'Critical': return '#ef4444';
        }
    };

    return (
        <div className="card-gradient border border-slate-800 rounded-xl p-6 relative overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <MousePointer2 size={16} />
                    </div>
                    <h3 className="font-black text-white uppercase text-[10px] tracking-[0.2em]">Live Warehouse Heatmap</h3>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Optimal</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" /> Warning</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" /> Critical</div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 relative">
                <svg viewBox="0 0 500 350" className="w-full max-w-2xl h-auto drop-shadow-2xl">
                    {/* Warehouse Floor */}
                    <rect x="25" y="25" width="450" height="300" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="2" strokeDasharray="8 8" />

                    {/* Zones */}
                    {zones.map((zone) => (
                        <motion.path
                            key={zone.id}
                            d={zone.path}
                            fill={getStatusColor(zone.status, hoveredZone?.id === zone.id)}
                            stroke={getStatusBorder(zone.status)}
                            strokeWidth={hoveredZone?.id === zone.id ? 2 : 1}
                            initial={{ opacity: 0.5 }}
                            animate={{
                                opacity: 1,
                                fill: getStatusColor(zone.status, hoveredZone?.id === zone.id)
                            }}
                            onMouseEnter={() => setHoveredZone(zone)}
                            onMouseLeave={() => setHoveredZone(null)}
                            onClick={() => onZoneClick?.(zone)}
                            className="cursor-pointer transition-all duration-300 hover:brightness-125"
                        />
                    ))}

                    {/* Hallways / Markers */}
                    <line x1="160" y1="50" x2="160" y2="270" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="285" y1="50" x2="285" y2="270" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                </svg>

                {/* Tooltip-like Info Panel */}
                <div className="absolute bottom-6 right-6 left-6 flex items-center gap-4 p-3 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-xl h-16 shadow-2xl">
                    {hoveredZone ? (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between w-full"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-white">
                                    {hoveredZone.id}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Sector</p>
                                    <p className="text-sm font-black text-white leading-tight">{hoveredZone.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Health Index</p>
                                <div className="flex items-center gap-2 justify-end">
                                    <span className="text-sm font-black" style={{ color: getStatusBorder(hoveredZone.status) }}>{hoveredZone.status.toUpperCase()}</span>
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: getStatusBorder(hoveredZone.status) }} />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex items-center gap-3 text-slate-600 w-full justify-center">
                            <Info size={14} className="animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Engage sectors to retrieve telemetry data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
