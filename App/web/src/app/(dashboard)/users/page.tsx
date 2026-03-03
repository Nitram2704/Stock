'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users as UsersIcon, Shield, UserPlus, Mail } from 'lucide-react';
import { InviteMemberModal } from '@/components/InviteMemberModal';
import { UserStatsCard } from '@/components/UserStatsCard';

interface Profile {
    id: string;
    full_name: string;
    role: 'Admin' | 'Manager' | 'Operator';
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setUsers(data as any);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="flex-1">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <UsersIcon size={24} />
                        </div>
                        <h1 className="text-3xl font-bold">Team Management</h1>
                    </div>
                    <p className="text-slate-400 mt-1">Manage personnel, assign roles, and audit access levels.</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    Invite Member
                </button>
            </header>

            <div className="card-gradient rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-800/20">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Member</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Activity Stats</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Role / Email</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-600 italic">
                                        {loading ? 'Fetching team directory...' : 'No users found.'}
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-blue-500/2 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-black text-sm">
                                                {u.full_name ? u.full_name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{u.full_name || 'Anonymous User'}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Active Now</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-[320px]">
                                        <UserStatsCard userId={u.id} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <div className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border w-fit ${u.role === 'Admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                                u.role === 'Manager' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                                    'bg-slate-700/30 text-slate-400 border-slate-700/50'
                                                }`}>
                                                <Shield size={12} />
                                                {u.role.toUpperCase()}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] hover:text-blue-400 cursor-pointer transition-colors max-w-[150px] truncate">
                                                <Mail size={10} />
                                                {u.id.split('-')[0]}@stockapp.io
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                                            className="px-4 py-1.5 text-[10px] font-black text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg transition-all uppercase tracking-widest bg-slate-900/50"
                                        >
                                            {expandedUser === u.id ? 'Close' : 'Inspect'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={fetchUsers}
            />
        </div>
    );
}
