'use client';

import { useState, useEffect } from 'react';
import { ProductItem } from '@/components/ProductItem';
import { LayoutGrid, Search, Loader2 } from 'lucide-react';

interface Product {
    id: string;
    sku_qr: string;
    name: string;
    category: string;
    stock_actual: number;
    unit: string;
}

export default function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/v1/inventory');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error('Failed to fetch catalog:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku_qr.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white uppercase">Neural Catalog</h1>
                    <p className="text-slate-500 mt-1 font-medium italic">High-fidelity scannable inventory grid.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={() => window.print()}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all no-print flex items-center justify-center gap-2"
                    >
                        Print Labels
                    </button>
                    <div className="relative w-full md:w-80 no-print">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH NEURAL RECORDS..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all uppercase tracking-widest"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Loader2 className="text-blue-500 animate-spin" size={40} />
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Synching Neural Grid...</span>
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductItem key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/5 rounded-3xl">
                    <LayoutGrid className="text-slate-800 mb-4" size={48} />
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">No records found in grid.</span>
                </div>
            )}
        </div>
    );
}
