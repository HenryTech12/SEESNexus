import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import AppLayout from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Camera, CheckCircle2, Info, ArrowRight } from "lucide-react";
import hardwareService from "../services/hardwareService";
import { Hardware, HardwareStatus } from "../types";
import { formatError } from "../utils/errorHelper";
import { getItemImage } from "../utils/imageHelper";
import toast from "react-hot-toast";

// Asset tag QR codes encode a deep link (e.g. ".../hardware/scan?id=<id>") so
// any phone camera app can open them directly, not just the in-app scanner.
// Extract the id whether we got a raw id/serial or a full deep-link URL.
const extractScanTarget = (raw: string): string => {
  try {
    return new URL(raw).searchParams.get("id") || raw;
  } catch {
    return raw;
  }
};

const QRScanner = () => {
  const [searchParams] = useSearchParams();
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [hardware, setHardware] = useState<Hardware | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [purpose, setPurpose] = useState("");

  const resolveHardware = useCallback(async (id: string) => {
    setScannedId(id);
    setIsLoading(true);
    try {
      // The scanned value is usually a hardware id (deep links always encode
      // one) — fetch it directly so this isn't subject to list pagination.
      // Only fall back to scanning the full list when it's a serial number
      // instead, since there's no backend "get by serial" endpoint.
      try {
        const item = await hardwareService.getById(id);
        setHardware(item);
        return;
      } catch {
        // Not a valid id — fall through to the serial-number search below.
      }

      // limit: 100 — backend defaults to 10, which would make this serial
      // lookup miss any item beyond the first page.
      const items = await hardwareService.getAll({ limit: 100 });
      const item = items.find((h) => h.serial_number === id);

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
  }, []);

  // Deep-link entry: a phone camera app opened ".../hardware/scan?id=..."
  // directly, so resolve it immediately without needing the webcam.
  useEffect(() => {
    const deepLinkId = searchParams.get("id");
    if (deepLinkId) resolveHardware(deepLinkId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = (result: unknown) => {
    if (result && !isLoading && !hardware) {
      const text = (result as { text?: string })?.text;
      const id = extractScanTarget((text || result) as string);
      if (id === scannedId) return;
      resolveHardware(id);
    }
  };

  const handleLoanRequest = async () => {
    if (!hardware) return;
    if (!purpose.trim()) {
      toast.error("Loan purpose is required");
      return;
    }

    setIsRequesting(true);
    try {
      await hardwareService.requestLoan(hardware.id, {
        purpose,
        expected_return_date: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });
      toast.success("Loan request transmitted to Command Center");
      setHardware(null);
      setScannedId(null);
      setPurpose("");
    } catch (error) {
      toast.error(formatError(error, "Loan authorization failed"));
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <AppLayout>
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-full bg-[repeating-linear-gradient(0deg,_transparent,_transparent_2px,_rgba(16,185,129,0.1)_3px)] bg-[length:100%_4px]" />
      </div>

      <div className="max-w-2xl mx-auto pt-10">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 text-emerald-500 text-xs font-black tracking-[0.3em] mb-4">
            <QrCode className="w-5 h-5 shadow-glow-mint" />
            OPTICAL SCANNER ACTIVE
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter">
            HARDWARE IDENTIFICATION
          </h1>
        </header>

        {!hardware ? (
          <div className="glass-card aspect-square relative overflow-hidden border border-emerald-500/20">
            <div className="absolute inset-0">
              <QrReader
                onResult={handleScan}
                constraints={{ facingMode: "environment" }}
                containerStyle={{ width: "100%", height: "100%" }}
                videoStyle={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.4,
                }}
              />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              <div className="w-20 h-20 border-2 border-emerald-500 rounded-lg flex items-center justify-center mb-6 animate-pulse">
                <Camera className="text-emerald-500 w-10 h-10" />
              </div>
              <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs">
                {isLoading ? "DECRYPTING..." : "ALIGN QR CODE WITH VIEWER"}
              </p>
            </div>

            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-emerald-500 z-20" />
            <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-emerald-500 z-20" />
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-emerald-500 z-20" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-emerald-500 z-20" />
          </div>
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
                    onClick={() => {
                      setHardware(null);
                      setScannedId(null);
                    }}
                    className="text-[10px] text-red-500 font-black underline"
                  >
                    RESCAN
                  </button>
                </div>

                <div className="p-8">
                  <div className="flex gap-8 mb-8">
                    <div className="w-32 h-32 bg-black border border-emerald-500/20 rounded-lg overflow-hidden">
                      <img
                        src={
                          hardware.image_url ||
                          getItemImage(
                            `${hardware.name} ${hardware.category} electronic component engineering laboratory`,
                            hardware.id,
                            200,
                            200,
                          )
                        }
                        alt={hardware.name}
                        loading="lazy"
                        className="w-full h-full object-cover grayscale"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-emerald-500 font-bold mb-1 uppercase tracking-widest">
                        {hardware.category}
                      </div>
                      <h3 className="text-2xl font-black mb-2 italic">
                        NX-{hardware.serial_number || hardware.id.slice(0, 8)}
                      </h3>
                      <p className="text-gray-400 text-xs italic line-clamp-2">
                        "{hardware.description}"
                      </p>

                      <div className="flex items-center gap-3 mt-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-black border ${
                            hardware.status === HardwareStatus.AVAILABLE
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                              : "bg-red-500/20 text-red-400 border-red-500/50"
                          }`}
                        >
                          {hardware.status}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          AVAILABLE UNITS: {hardware.available_quantity}/
                          {hardware.quantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">
                        Loan Purpose / Project Name
                      </label>
                      <textarea
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Input specific mission parameters..."
                        className="w-full bg-black border border-emerald-500/20 rounded-lg p-3 text-xs text-white focus:border-emerald-500 outline-none transition-all h-24 resize-none"
                      />
                    </div>

                    <Button
                      onClick={handleLoanRequest}
                      disabled={isRequesting || hardware.available_quantity === 0}
                      className="w-full py-4 text-xs shadow-glow-mint"
                    >
                      {isRequesting
                        ? "TRANSMITTING..."
                        : "INITIALIZE LOAN PROTOCOL"}
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
      </div>
    </AppLayout>
  );
};

export default QRScanner;
