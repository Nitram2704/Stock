import { LayoutDashboard, Box, History, Users, Settings } from 'lucide-react';
import Link from 'next/link';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Box, label: 'Inventory', href: '/inventory' },
    { icon: History, label: 'Catalog', href: '/catalog' },
    { icon: History, label: 'Movements', href: '/movements' },
    { icon: Users, label: 'Users', href: '/users' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-linear-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                    IOT LOGISTICS
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                        MC
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Monica Chen</p>
                        <p className="text-xs text-slate-500 truncate">Manager</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
