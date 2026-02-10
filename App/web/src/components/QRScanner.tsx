'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Scan, Loader2, CheckCircle2, AlertCircle, RefreshCw, Settings2 } from 'lucide-react';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => Promise<void>;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle');
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
    const [showCameraSelect, setShowCameraSelect] = useState(false);

    // Independent ref for the library instance to prevent React renders from wiping it
    const qrCodeRef = useRef<Html5Qrcode | null>(null);
    const [hasCamera, setHasCamera] = useState(false);

    const stopScanner = useCallback(async () => {
        const scanner = qrCodeRef.current;
        if (scanner) {
            try {
                if (scanner.isScanning) {
                    await scanner.stop();
                }
                const el = document.getElementById('qr-reader');
                if (el) {
                    // Ensure we clean up but don't error if empty
                    await scanner.clear();
                }
            } catch (err) {
                console.warn('Scanner cleanup warning:', err);
            }
        }
        qrCodeRef.current = null;
    }, []);

    const handleClose = useCallback(async () => {
        await stopScanner();
        setShowCameraSelect(false);
        onClose();
        setStatus('idle');
        setScanResult(null);
        setErrorMessage(null);
    }, [onClose, stopScanner]);

    const startScanner = useCallback(async () => {
        if (!isOpen) return;

        try {
            await stopScanner();

            // Get cameras first if not already listed
            if (cameras.length === 0) {
                try {
                    const devices = await Html5Qrcode.getCameras();
                    if (devices && devices.length) {
                        setCameras(devices);
                        // Default to the first one or a "back" camera if found
                        const backCam = devices.find(d => d.label.toLowerCase().includes('back'));
                        if (!selectedCameraId) {
                            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
                        }
                    }
                } catch (e) {
                    console.warn('Error fetching cameras', e);
                }
            }

            const html5QrCode = new Html5Qrcode('qr-reader');
            qrCodeRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.CODE_128
                ]
            };

            // Use specific camera ID if selected, otherwise environment facing mode
            const cameraConfig = selectedCameraId ? { deviceId: selectedCameraId } : { facingMode: 'environment' };

            await html5QrCode.start(
                cameraConfig,
                config,
                async (decodedText) => {
                    qrCodeRef.current?.pause();

                    setScanResult(decodedText);
                    setStatus('processing');

                    try {
                        await onScan(decodedText);
                        setStatus('success');
                        setTimeout(() => {
                            handleClose();
                        }, 1500);
                    } catch (error: any) {
                        setErrorMessage(error.message || 'Verification Failed');
                        setStatus('error');
                        setTimeout(() => {
                            if (qrCodeRef.current) {
                                qrCodeRef.current.resume();
                                setStatus('scanning');
                            }
                        }, 3000);
                    }
                },
                () => { }
            );

            setStatus('scanning');
            setHasCamera(true);
        } catch (err: any) {
            console.error('Camera access failed:', err);

            // Specific handling for DroidCam / AbortError
            if (err?.name === 'AbortError' || err?.toString().includes('AbortError')) {
                setErrorMessage('Camera connection timeout. Check DroidCam.');
            } else if (err?.name === 'NotAllowedError') {
                setErrorMessage('Permission denied.');
            } else {
                setErrorMessage('Camera access failed.');
            }

            setStatus('error');
            setHasCamera(false);
        }
    }, [isOpen, onScan, stopScanner, handleClose, cameras, selectedCameraId]);

    // Restart scanner when camera selection changes
    useEffect(() => {
        if (selectedCameraId && isOpen && status === 'scanning') {
            const restart = async () => {
                await stopScanner();
                await startScanner();
            };
            restart();
        }
    }, [selectedCameraId]); // Intentionally limited to response to selection change

    useEffect(() => {
        let isActive = true;

        if (isOpen) {
            const timer = setTimeout(() => {
                if (isActive) startScanner();
            }, 500); // Increased timeout for DroidCam to settle
            return () => {
                isActive = false;
                clearTimeout(timer);
                stopScanner();
            };
        } else {
            stopScanner();
        }

        return () => {
            isActive = false;
            stopScanner();
        };
    }, [isOpen, startScanner, stopScanner]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="scanner-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
                    >
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                    <Scan size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Neural Scanner</h2>
                                    {cameras.length > 1 && (
                                        <button
                                            onClick={() => setShowCameraSelect(!showCameraSelect)}
                                            className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 hover:text-blue-400 transition-colors"
                                        >
                                            <Settings2 size={10} />
                                            {showCameraSelect ? 'Hide Inputs' : 'Switch Source'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Camera Selection Panel */}
                        <AnimatePresence>
                            {showCameraSelect && cameras.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-slate-950/50 border-b border-white/5 overflow-hidden"
                                >
                                    <div className="p-4 flex flex-col gap-2">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Select Video Input</p>
                                        {cameras.map(cam => (
                                            <button
                                                key={cam.id}
                                                onClick={() => {
                                                    setSelectedCameraId(cam.id);
                                                    setShowCameraSelect(false);
                                                }}
                                                className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${selectedCameraId === cam.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                            >
                                                {cam.label || `Camera ${cam.id.substr(0, 5)}...`}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-8 flex flex-col items-center">
                            {/* Container specifically for the library - DO NOT PUT CHILDREN HERE */}
                            <div className="relative w-full max-w-xs aspect-square bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
                                <div id="qr-reader" className="w-full h-full" />

                                {/* Overlay Interface - Absolutely Positioned ON TOP */}
                                <div className="absolute inset-0 pointer-events-none z-20">
                                    {status === 'idle' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600 bg-slate-950">
                                            <Loader2 className="animate-spin" size={24} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Initializing Optics...</p>
                                        </div>
                                    )}

                                    {(status === 'scanning' || status === 'processing') && (
                                        <>
                                            <div className="absolute inset-0 border-[40px] border-slate-950/50" />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500/30 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.1)]" />
                                            {status === 'scanning' && (
                                                <motion.div
                                                    animate={{ top: ['22%', '78%', '22%'] }}
                                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                                                    className="absolute left-1/2 -translate-x-1/2 w-48 h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 text-center space-y-4 w-full h-12 flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {status === 'processing' ? (
                                        <motion.div
                                            key="processing"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex flex-col items-center gap-2"
                                        >
                                            <Loader2 className="animate-spin text-blue-500" size={24} />
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Decrypting SKU: {scanResult?.substring(0, 8)}...</p>
                                        </motion.div>
                                    ) : status === 'success' ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center gap-1 text-emerald-500"
                                        >
                                            <CheckCircle2 size={24} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Signal Verified</p>
                                        </motion.div>
                                    ) : status === 'error' ? (
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center gap-1 text-red-500 px-4"
                                        >
                                            <AlertCircle size={24} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-center">{errorMessage || 'Lens Error'}</p>
                                            <button
                                                onClick={() => startScanner()}
                                                className="mt-2 text-[10px] font-black text-slate-400 hover:text-white flex items-center gap-1 transition-colors bg-slate-800 px-3 py-1 rounded-full pointer-events-auto"
                                            >
                                                <RefreshCw size={10} />
                                                Retry Optics
                                            </button>
                                        </motion.div>
                                    ) : status === 'scanning' ? (
                                        <motion.div
                                            key="scanning"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center gap-1"
                                        >
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Camera size={14} className="animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Stream Active • High Precision</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium">Position target within vector frame.</p>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-center">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Neural Engine v4.2.0 • Quantum Optics Active</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
