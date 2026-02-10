'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function InviteMemberModal({ isOpen, onClose, onSuccess }: InviteMemberModalProps) {
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'Admin' | 'Manager' | 'Operator'>('Operator');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // In a real app, this would send an invite email or create an auth user.
            // For this demo, we'll directly insert into the profiles table.
            const { error } = await supabase
                .from('profiles')
                .insert([
                    {
                        full_name: fullName,
                        role: role
                    }
                ]);

            if (error) throw error;

            onSuccess();
            onClose();
            setFullName('');
            setRole('Operator');
        } catch (error: any) {
            console.error('Error inviting member:', error);
            alert('Failed to invite member: ' + error.message);
        } finally {
            setIsSubmitting(false);
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
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                        <UserPlus size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Invite Member</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="e.g. John Doe"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Role</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['Admin', 'Manager', 'Operator'] as const).map((r) => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setRole(r)}
                                                    className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${role === r
                                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                                        }`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3">
                                    <Shield className="text-blue-500 shrink-0" size={18} />
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                        Invited members will receive system credentials automatically. Roles can be modified later in the settings panel.
                                    </p>
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Sending Invitation...
                                        </>
                                    ) : (
                                        'Complete Invitation'
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
