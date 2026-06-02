import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import { Sidebar } from "../components/layout/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Camera, CheckCircle2, Info, ArrowRight } from "lucide-react";
import api from "../api/axios";
import { Hardware, HardwareStatus } from "../types";
import { formatError } from "../utils/errorHelper";
import toast from "react-hot-toast";

const QRScanner = () => {
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [hardware, setHardware] = useState<Hardware | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [purpose, setPurpose] = useState("");

    const handleScan = async (result: any) => {
        if (result && !isLoading && !hardware) {
            const id = result?.text || result;
            if (id === scannedId) return;
            
            setScannedId(id);
            setIsLoading(true);
            try {
                const response = await api.get("/hardware/");
                const items = response.data.data.hardware || response.data.data || [];
                const item = items.find((h: Hardware) => h.id === id || h.serial_number === id);
                
                if (item) {
                    setHardware(item);
                } else {
                    toast.error("Component signature not found in Nexus archive");
                    setScannedId(null);
                }
            } catch (error) {
                toast.error("Failed to decrypt component data");
                setScannedId(null);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleLoanRequest = async () => {
        if (!hardware || !purpose) return;
        
        setIsRequesting(true);
        try {
            await api.post(`/hardware/${hardware.id}/loan`, {
                purpose,
                expected_return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });
            toast.success("Loan request transmitted to Command Center");
            setHardware(null);
            setScannedId(null);
            setPurpose("");
        } catch (error: any) {
            toast.error(formatError(error, "Loan authorization failed"));
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white font-mono overflow-hidden">
            <Sidebar />

            <main className="flex-1 lg:ml-64 p-8 relative">
                <div className="absolute inset-0 pointer-events-none opacity-5">
                    <div className="w-full h-full bg-[repeating-linear-gradient(0deg,_transparent,_transparent_2px,_rgba(16,185,129,0.1)_3px)] bg-[length:100%_4px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl mx-auto pt-10"
                >
                    <header className="mb-10 text-center">
                        <div className="inline-flex items-center gap-3 text-emerald-500 text-xs font-black tracking-[0.3em] mb-4">
                            <QrCode className="w-5 h-5 shadow-glow-mint" />
                            OPTICAL_SCANNER_ACTIVE
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter">
                            HARDWARE_IDENTIFICATION
                        </h1>
                    </header>

                    {!hardware ? (
                        <GlassCard className="aspect-square relative overflow-hidden flex flex-col items-center justify-center border-emerald-500/20">
                            <div className="absolute inset-0 z-0">
                                <QrReader
                                    onResult={handleScan}
                                    constraints={{ facingMode: "environment" }}
                                    containerStyle={{ width: "100%", height: "100%" }}
                                    videoStyle={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }}
                                />
                            </div>
                            
                            <div className="relative z-10 text-center pointer-events-none">
                                <div className="w-20 h-20 border-2 border-emerald-500 rounded-lg flex items-center justify-center mb-6 animate-pulse">
                                    <Camera className="text-emerald-500 w-10 h-10" />
                                </div>
                                <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs">
                                    {isLoading ? "DECRYPTING..." : "ALIGN QR CODE WITH VIEWER"}
                                </p>
                            </div>

                            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-emerald-500" />
                            <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-emerald-500" />
                            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-emerald-500" />
                            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-emerald-500" />
                        </GlassCard>
                    ) : (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <GlassCard className="border-emerald-500/50 p-0 overflow-hidden">
                                    <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/20 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                                            <CheckCircle2 size={16} />
                                            IDENTIFIED: {hardware.name}
                                        </div>
                                        <button 
                                            onClick={() => { setHardware(null); setScannedId(null); }}
                                            className="text-[10px] text-red-500 font-black underline"
                                        >
                                            RESCAN
                                        </button>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex gap-8 mb-8">
                                            <div className="w-32 h-32 bg-black border border-emerald-500/20 rounded-lg overflow-hidden">
                                                <img 
                                                    src={hardware.image_url || "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=200"} 
                                                    alt={hardware.name}
                                                    className="w-full h-full object-cover grayscale"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[10px] text-emerald-500 font-bold mb-1 uppercase tracking-widest">{hardware.category}</div>
                                                <h3 className="text-2xl font-black mb-2 italic">NX-{hardware.serial_number || hardware.id.slice(0, 8)}</h3>
                                                <p className="text-gray-400 text-xs italic line-clamp-2">"{hardware.description}"</p>
                                                
                                                <div className="flex items-center gap-3 mt-4">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${
                                                        hardware.status === HardwareStatus.AVAILABLE ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'
                                                    }`}>
                                                        {hardware.status}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-500">
                                                        AVAILABLE UNITS: {hardware.available_quantity}/{hardware.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Loan Purpose / Project Name</label>
                                                <textarea 
                                                    value={purpose}
                                                    onChange={(e) => setPurpose(e.target.value)}
                                                    placeholder="Input specific mission parameters..."
                                                    className="w-full bg-black border border-emerald-500/20 rounded-lg p-3 text-xs text-white focus:border-emerald-500 outline-none transition-all h-24 resize-none"
                                                />
                                            </div>

                                            <Button 
                                                onClick={handleLoanRequest}
                                                disabled={!purpose || isRequesting || hardware.available_quantity === 0}
                                                className="w-full py-4 text-xs shadow-glow-mint"
                                            >
                                                {isRequesting ? "TRANSMITTING..." : "INITIALIZE LOAN PROTOCOL"}
                                            </Button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    <div className="mt-8 flex justify-center gap-10 opacity-40">
                        <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest">
                            <Info size={12} className="text-emerald-500" />
                            Auto-verify Enabled
                        </div>
                        <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest">
                            <ArrowRight size={12} className="text-emerald-500" />
                            Direct Sync Output
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default QRScanner;
