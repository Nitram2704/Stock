import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    label: string;
    value: string | number;
    trend?: string;
    icon: LucideIcon;
    variant?: 'default' | 'alert' | 'success';
    onClick?: () => void;
}

export function KPICard({ label, value, trend, icon: Icon, variant = 'default', onClick }: KPICardProps) {
    const variantStyles = {
        default: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
        alert: 'text-red-500 border-red-500/20 bg-red-500/5',
        success: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    };

    return (
        <div
            onClick={onClick}
            className={`card-gradient rounded-xl p-6 relative overflow-hidden group transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5 active:scale-[0.98]' : ''}`}
        >
            <div className={`absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <Icon size={80} />
            </div>
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                    <div className={`p-2 rounded-lg border ${variantStyles[variant]}`}>
                        <Icon size={20} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-[0.1em]">{label}</span>
                </div>
                <div className="flex items-end justify-between">
                    <h2 className="text-3xl font-black text-white tracking-tight">{value}</h2>
                    {trend && (
                        <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {trend}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
