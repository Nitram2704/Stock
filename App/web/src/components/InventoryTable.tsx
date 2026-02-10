'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, MoreVertical, AlertCircle, CheckCircle2, TrendingDown, ChevronDown, Trash2, Edit } from 'lucide-react';
import { NewItemModal } from './NewItemModal';
import { EditItemModal } from './EditItemModal';

interface Product {
    id: string;
    sku_qr: string;
    name: string;
    category: string;
    stock_actual: number;
    stock_minimo: number;
    status: 'Normal' | 'Low' | 'Empty';
}

export function InventoryTable() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (data) {
            const processed = data.map((p: any) => ({
                ...p,
                status: p.stock_actual <= 0 ? 'Empty' : p.stock_actual <= p.stock_minimo ? 'Low' : 'Normal'
            })) as Product[];
            setProducts(processed);

            const uniqueCategories = Array.from(new Set(processed.map(p => p.category))).filter(Boolean);
            setCategories(['All', ...uniqueCategories]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        let result = products;

        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.sku_qr.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query)
            );
        }

        setFilteredProducts(result);
    }, [searchQuery, selectedCategory, products]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting product: ' + error.message);
        } else {
            fetchProducts();
        }
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    return (
        <div className="card-gradient rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            {/* ... header ... */}
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by SKU, Product or Category..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors text-slate-300"
                        >
                            <Filter size={16} />
                            {selectedCategory}
                            <ChevronDown size={14} className={`transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showCategoryMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setShowCategoryMenu(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-800 transition-colors ${selectedCategory === cat ? 'text-blue-500 font-bold' : 'text-slate-400'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                    >
                        <span>+</span>
                        New Item
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-800/20">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">SKU / QR</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Product Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Category</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Stock</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Threshold</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-600">
                                        <AlertCircle size={40} className="opacity-20" />
                                        <p className="font-medium">{loading ? 'Loading catalog data...' : 'Zero matches found.'}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-500/20">
                                        {product.sku_qr}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-slate-200">{product.name}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-slate-500 text-xs px-2 py-1 bg-slate-800 rounded">{product.category}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-mono text-sm ${product.stock_actual <= product.stock_minimo ? 'text-red-500' : 'text-slate-100'}`}>
                                        {product.stock_actual}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm font-mono">{product.stock_minimo}</td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-full border w-fit ${product.status === 'Normal' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' :
                                        product.status === 'Low' ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' :
                                            'bg-red-500/5 text-red-500 border-red-500/20'
                                        }`}>
                                        {product.status === 'Normal' ? <CheckCircle2 size={12} /> :
                                            product.status === 'Low' ? <TrendingDown size={12} /> :
                                                <AlertCircle size={12} />}
                                        {product.status.toUpperCase()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-2 hover:bg-blue-500/10 text-slate-600 hover:text-blue-500 rounded-lg transition-all"
                                            title="Edit Product"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-lg transition-all"
                                            title="Delete Product"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            className="p-2 hover:bg-slate-800 text-slate-600 hover:text-white rounded-lg transition-all"
                                            title="More Options"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <NewItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProducts}
            />

            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchProducts}
                product={selectedProduct}
            />
        </div>
    );
}
