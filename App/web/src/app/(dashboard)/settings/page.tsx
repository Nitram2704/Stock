'use client';

import { Settings as SettingsIcon, Zap, Shield, Database, Cpu, Save } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="flex-1 max-w-4xl">
            <header className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <SettingsIcon size={24} />
                    </div>
                    <h1 className="text-3xl font-bold">System Settings</h1>
                </div>
                <p className="text-slate-400 mt-1">Configure global parameters, IoT connection strings, and security policies.</p>
            </header>

            <div className="space-y-6">
                {/* General Config */}
                <section className="card-gradient border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex items-center gap-2">
                        <Cpu size={16} className="text-blue-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">IoT Hub Configuration</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Hub Connection String</label>
                                <input disabled type="password" value="sb_iot_h284x_k9120asx..." className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-4 text-xs font-mono text-slate-400 cursor-not-allowed" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Telemetry Interval</label>
                                <select className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-4 text-xs font-bold text-white outline-none">
                                    <option>250ms (Real-time)</option>
                                    <option>1000ms (Power Save)</option>
                                    <option>5000ms (Eco Mode)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Performance Config */}
                <section className="card-gradient border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex items-center gap-2">
                        <Zap size={16} className="text-amber-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Edge Optimization</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                            <div>
                                <h4 className="text-sm font-bold text-white">Neural Cache Aggression</h4>
                                <p className="text-xs text-slate-500">Minimize DB roundtrips by enabling proactive caching.</p>
                            </div>
                            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                            <div>
                                <h4 className="text-sm font-bold text-white">Stream Encryption (TLS 1.3)</h4>
                                <p className="text-xs text-slate-500">Enable end-to-end payload encryption for all sensor streams.</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-800 rounded-full relative">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-slate-600 rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Database Stats */}
                <section className="card-gradient border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex items-center gap-2">
                        <Database size={16} className="text-purple-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Persistence Health</h3>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-6">
                            <div className="flex-1 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Row Count</p>
                                <p className="text-2xl font-black text-white">82.4K</p>
                            </div>
                            <div className="flex-1 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Index Size</p>
                                <p className="text-2xl font-black text-white">124MB</p>
                            </div>
                            <div className="flex-1 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Active Conn</p>
                                <p className="text-2xl font-black text-emerald-500">12</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2">
                        <Save size={18} />
                        Save Modifications
                    </button>
                </div>
            </div>
        </div>
    );
}
