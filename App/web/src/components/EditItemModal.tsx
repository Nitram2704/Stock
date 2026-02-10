'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Tag, Layers, Hash, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: any;
}

export function EditItemModal({ isOpen, onClose, onSuccess, product }: EditItemModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        stock_minimo: 5,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                category: product.category,
                stock_minimo: product.stock_minimo,
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from('products')
                .update(formData)
                .eq('id', product.id);

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating item:', error);
            alert('Failed to update item: ' + error.message);
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
                                    <h2 className="text-xl font-bold text-white">Edit Product</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-1.5 opacity-50">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Hash size={12} /> SKU / QR Code (Read Only)
                                    </label>
                                    <input
                                        disabled
                                        type="text"
                                        value={product?.sku_qr}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-sm text-slate-500 outline-none"
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
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            'Updating...'
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save Changes
                                            </>
                                        )}
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
