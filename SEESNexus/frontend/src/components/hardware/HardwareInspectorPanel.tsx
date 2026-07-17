import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  X,
  Hash,
  Loader2,
  Package,
  QrCode,
  Download,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type { Hardware, HardwareLoan } from "../../types";
import { UserRole } from "../../types";
import hardwareService from "../../services/hardwareService";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/Button";
import { formatError } from "../../utils/errorHelper";
import { getItemImage } from "../../utils/imageHelper";
import toast from "react-hot-toast";

interface Props {
  item: Hardware;
  onClose: () => void;
  onLoanSuccess: () => void;
}

const tomorrow = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const availabilityLabel = (qty: number) =>
  qty > 5 ? "AVAILABLE" : qty > 0 ? "LOW STOCK" : "OUT OF STOCK";

const statusClasses = (qty: number) =>
  qty > 5
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
    : qty > 0
      ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      : "bg-red-500/20 text-red-500 border-red-500/50";

const barColor = (qty: number) =>
  qty > 5 ? "bg-emerald-500" : qty > 0 ? "bg-yellow-500" : "bg-red-500";

const loanStatusClasses = (status: HardwareLoan["status"]) =>
  status === "APPROVED"
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
    : "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";

const HardwareInspectorPanel: React.FC<Props> = ({
  item,
  onClose,
  onLoanSuccess,
}) => {
  const [loanHistoryCount, setLoanHistoryCount] = useState<number | null>(null);
  const [purpose, setPurpose] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myLoan, setMyLoan] = useState<HardwareLoan | null>(null);
  const [isLoanStatusLoading, setIsLoanStatusLoading] = useState(true);
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const isAdmin = useAuthStore((s) => s.user?.role === UserRole.ADMIN);

  // Fetch extra detail in the background
  useEffect(() => {
    hardwareService
      .getById(item.id)
      .then((detail) => setLoanHistoryCount(detail.loan_history_count ?? 0))
      .catch(() => {});
  }, [item.id]);

  // No per-item loan history endpoint exists, so derive "your" status for
  // this item by filtering the current user's own loans client-side.
  useEffect(() => {
    setIsLoanStatusLoading(true);
    hardwareService
      .getMyLoans()
      .then((loans) => {
        const active = loans.find(
          (l) =>
            l.hardware_id === item.id &&
            (l.status === "PENDING" || l.status === "APPROVED"),
        );
        setMyLoan(active ?? null);
      })
      .catch(() => {})
      .finally(() => setIsLoanStatusLoading(false));
  }, [item.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !returnDate) {
      toast.error("Purpose and return date are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await hardwareService.requestLoan(item.id, {
        purpose,
        expected_return_date: new Date(returnDate).toISOString(),
      });
      toast.success("Loan request submitted!");
      onLoanSuccess();
    } catch (err) {
      toast.error(formatError(err, "Failed to submit request"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${item.serial_number || item.id}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const availPct =
    item.quantity > 0
      ? Math.round((item.available_quantity / item.quantity) * 100)
      : 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <motion.aside
        className="fixed top-0 right-0 h-screen w-full max-w-[440px] bg-[#080808] border-l border-emerald-500/20 z-50 flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        {/* Image header */}
        <div className="relative h-52 flex-shrink-0 overflow-hidden bg-emerald-900/20">
          {/* Fallback always rendered behind — visible when image fails or is slow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-10 h-10 text-emerald-500/10" />
          </div>
          <img
            src={
              item.image_url ||
              getItemImage(
                `${item.name} ${item.category} electronic component engineering laboratory`,
                item.id,
                440,
                208,
              )
            }
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover relative"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/30 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/70 border border-white/10 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-5">
            <span
              className={`px-2 py-1 rounded text-[10px] font-bold border ${statusClasses(item.available_quantity)}`}
            >
              {availabilityLabel(item.available_quantity)}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Identity block */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-emerald-500 text-xs font-bold tracking-widest">
                {item.category}
              </span>
              {item.serial_number && (
                <span className="text-gray-500 text-xs font-mono flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {item.serial_number}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-3">
              {item.name}
            </h2>
            {item.description && (
              <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-emerald-500/30 pl-3 italic">
                "{item.description}"
              </p>
            )}
          </div>

          {/* Inventory stats */}
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-gray-400 uppercase tracking-wider">
                Inventory
              </span>
              <span className="font-bold">
                {item.available_quantity} / {item.quantity} UNITS
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor(item.available_quantity)}`}
                style={{ width: `${availPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {item.quantity - item.available_quantity} currently loaned
              </span>
              {loanHistoryCount !== null ? (
                <span>{loanHistoryCount} total loans</span>
              ) : (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
            </div>
          </div>

          <div className="border-t border-white/5" />

          {/* Your loan status on this item */}
          {!isLoanStatusLoading && myLoan && (
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300">
                Your Loan Status
              </h3>
              <div className="flex items-center justify-between">
                <span
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border ${loanStatusClasses(myLoan.status)}`}
                >
                  {myLoan.status === "APPROVED" ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {myLoan.status}
                </span>
                <span className="text-xs text-gray-500">
                  Due {new Date(myLoan.expected_return_date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 italic">"{myLoan.purpose}"</p>
            </div>
          )}

          {/* Admin: asset tag QR code */}
          {isAdmin && (
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-300">
                <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                Asset Tag
              </h3>
              <div className="flex items-center gap-4">
                <div
                  ref={qrCanvasRef}
                  className="bg-white p-2 rounded-md flex-shrink-0"
                >
                  <QRCodeCanvas
                    value={`${window.location.origin}/hardware/scan?id=${item.id}`}
                    size={96}
                    level="M"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-gray-500">
                    Print and attach to the physical item. Scanning it opens
                    this item directly in the QR Scanner loan flow.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleDownloadQR}
                    className="w-full py-2 text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Download PNG
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loan request form — hidden once the user has a pending/active loan on this item */}
          {!myLoan && (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300">
                Request Loan
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">
                  Purpose
                </label>
                <textarea
                  minLength={10}
                  rows={3}
                  placeholder="Describe what you need this for..."
                  className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all placeholder:text-gray-600"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">
                  Return By
                </label>
                <input
                  type="date"
                  min={tomorrow()}
                  className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-sm tracking-widest"
                isLoading={isSubmitting}
                disabled={item.available_quantity === 0}
              >
                {item.available_quantity === 0
                  ? "NOT AVAILABLE"
                  : "SUBMIT REQUEST"}
              </Button>
            </form>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default HardwareInspectorPanel;
