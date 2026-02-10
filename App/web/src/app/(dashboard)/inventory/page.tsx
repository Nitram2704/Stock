'use client';

import { InventoryTable } from '@/components/InventoryTable';
import { Box, PackageSearch } from 'lucide-react';

export default function InventoryPage() {
    return (
        <div className="flex-1">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <PackageSearch size={24} />
                        </div>
                        <h1 className="text-3xl font-bold">Inventory Management</h1>
                    </div>
                    <p className="text-slate-400 mt-1">Manage SKU thresholds, view status, and adjust stock levels.</p>
                </div>
            </header>

            <section className="space-y-8">
                <InventoryTable />
            </section>
        </div>
    );
}
