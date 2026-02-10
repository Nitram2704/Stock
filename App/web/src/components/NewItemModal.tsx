'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Tag, Layers, Hash } from 'lucide-react';

interface NewItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NewItemModal({ isOpen, onClose, onSuccess }: NewItemModalProps) {
    const [formData, setFormData] = useState({
        sku_qr: '',
        name: '',
        category: '',
        stock_minimo: 5,
        stock_actual: 0,
        unit: 'pcs'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/v1/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    sku_qr: '',
                    name: '',
                    category: '',
                    stock_minimo: 5,
                    stock_actual: 0,
                    unit: 'pcs'
                });
            } else {
                alert('Failed to add item');
            }
        } catch (error) {
            console.error('Error adding item:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                        <Package size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Add New Product</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Hash size={12} /> SKU / QR Code
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.sku_qr}
                                        onChange={(e) => setFormData({ ...formData, sku_qr: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. SKU-XT-900"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Tag size={12} /> Product Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. High-Torque Servo"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Layers size={12} /> Category
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. Parts"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Initial Stock</label>
                                        <input
                                            type="number"
                                            value={formData.stock_actual}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setFormData({ ...formData, stock_actual: isNaN(val) ? 0 : val });
                                            }}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Min. Threshold</label>
                                        <input
                                            type="number"
                                            value={formData.stock_minimo}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setFormData({ ...formData, stock_minimo: isNaN(val) ? 0 : val });
                                            }}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loading ? 'Creating Product...' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
