import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { Package, Tag, Layers, Download, Copy, Check } from 'lucide-react';
import { useState, useRef } from 'react';

interface ProductItemProps {
    product: {
        sku_qr: string;
        name: string;
        category: string;
        stock_actual: number;
        unit: string;
    };
}

export function ProductItem({ product }: ProductItemProps) {
    const [copied, setCopied] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);
    const barcodeRef = useRef<HTMLDivElement>(null);

    const productUrl = `http://localhost:3000/inventory/product/${product.sku_qr}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(product.sku_qr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadAsPNG = (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
        if (!ref.current) return;
        const svg = ref.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Increase resolution for scanners (2x)
        const scale = 4;
        const svgSize = svg.getBoundingClientRect();
        canvas.width = svgSize.width * scale;
        canvas.height = svgSize.height * scale;

        img.onload = () => {
            if (!ctx) return;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `${filename}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="card-gradient rounded-2xl p-6 border border-white/5 hover:border-blue-500/30 transition-all duration-500 group relative">
            {/* Quick Actions Overlay */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                <button
                    onClick={handleCopy}
                    className="p-2 bg-slate-800/80 hover:bg-blue-600 rounded-lg text-white border border-white/10 transition-colors"
                    title="Copy SKU"
                >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
            </div>

            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Tag size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{product.category}</span>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase">
                        {product.name}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium font-mono">{product.sku_qr}</p>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-white/5 no-print">
                    <Package className="text-slate-400" size={20} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center gap-3 relative group/qr">
                    <div ref={qrRef} className="bg-white p-3 rounded-lg">
                        <QRCodeSVG value={product.sku_qr} size={100} level="M" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Product QR</span>
                    <button
                        onClick={() => downloadAsPNG(qrRef, `qr_${product.sku_qr}`)}
                        className="absolute inset-0 bg-blue-600/90 hidden group-hover/qr:flex items-center justify-center gap-2 text-white text-[10px] font-black uppercase rounded-xl no-print"
                    >
                        <Download size={14} /> Save PNG
                    </button>
                </div>
                <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center gap-3 relative group/bc">
                    <div ref={barcodeRef} className="bg-white px-2 py-1 rounded-lg scale-75 origin-center">
                        <Barcode value={product.sku_qr} height={40} width={1.5} fontSize={10} background="transparent" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Barcode</span>
                    <button
                        onClick={() => downloadAsPNG(barcodeRef, `bc_${product.sku_qr}`)}
                        className="absolute inset-0 bg-blue-600/90 hidden group-hover/bc:flex items-center justify-center gap-2 text-white text-[10px] font-black uppercase rounded-xl no-print"
                    >
                        <Download size={14} /> Save PNG
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Density</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-white">{product.stock_actual}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{product.unit}</span>
                </div>
            </div>
        </div>
    );
}
