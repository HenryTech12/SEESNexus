import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, ImageIcon, Loader2, RotateCcw } from "lucide-react";
import type { Hardware } from "../../types";
import { HardwareCategory, HardwareStatus } from "../../types";
import hardwareService from "../../services/hardwareService";
import { useImageUpload } from "../../hooks/useImageUpload";
import { Button } from "../ui/Button";
import { formatError } from "../../utils/errorHelper";
import toast from "react-hot-toast";

interface Props {
  item?: Hardware | null;
  onClose: () => void;
  onSaved: () => void;
}

const HardwareFormPanel: React.FC<Props> = ({ item, onClose, onSaved }) => {
  const isEdit = !!item;

  const [name, setName] = useState(item?.name || "");
  const [serialNumber, setSerialNumber] = useState(item?.serial_number || "");
  const [description, setDescription] = useState(item?.description || "");
  const [category, setCategory] = useState<HardwareCategory>(
    item?.category || HardwareCategory.COMPONENT,
  );
  const [status, setStatus] = useState<HardwareStatus>(
    item?.status || HardwareStatus.AVAILABLE,
  );
  const [quantity, setQuantity] = useState(item?.quantity ?? 1);
  const [isSaving, setIsSaving] = useState(false);

  const image = useImageUpload(item?.image_url || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !serialNumber.trim()) {
      toast.error("Name and serial number are required");
      return;
    }
    if (!quantity || quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (image.isPending) {
      toast.error(
        image.error
          ? "Image failed to upload — retry or remove it before saving"
          : "Image is still uploading — please wait",
      );
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      serial_number: serialNumber.trim(),
      category,
      status,
      image_url: image.confirmedUrl || undefined,
      quantity,
    };

    setIsSaving(true);
    try {
      if (item) {
        await hardwareService.update(item.id, payload);
        toast.success("Hardware updated");
      } else {
        await hardwareService.create(payload);
        toast.success("Hardware added");
      }
      onSaved();
    } catch (err) {
      toast.error(formatError(err, "Failed to save hardware item"));
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-lg font-bold uppercase tracking-tight">
            {isEdit ? "Edit Hardware" : "Add Hardware"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Serial Number
            </label>
            <input
              type="text"
              className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Category
              </label>
              <select
                className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as HardwareCategory)
                }
              >
                {Object.values(HardwareCategory).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Status
              </label>
              <select
                className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                value={status}
                onChange={(e) => setStatus(e.target.value as HardwareStatus)}
              >
                {Object.values(HardwareStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            {isEdit && (
              <p className="text-[10px] text-gray-600">
                Available units track loans separately and aren't edited
                directly here.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Photo
            </label>
            <input
              id="hardware-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) image.selectFile(file);
              }}
            />
            <button
              type="button"
              onClick={() =>
                document.getElementById("hardware-image-input")?.click()
              }
              disabled={image.isUploading}
              className="w-full flex items-center justify-center gap-2 bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm hover:border-emerald-500/50 transition-all disabled:opacity-50"
            >
              {image.isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4 text-emerald-500" />
              )}
              {image.isUploading ? "Uploading..." : "Choose Image"}
            </button>
            {image.displayedUrl && (
              <div className="relative rounded-md overflow-hidden aspect-video border border-white/10">
                <img
                  src={image.displayedUrl}
                  alt="Hardware preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={image.remove}
                  className="absolute top-2 right-2 p-1 bg-black/70 border border-white/10 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {image.error && (
              <div className="flex items-center justify-between gap-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3">
                <span>{image.error}</span>
                <button
                  type="button"
                  onClick={image.retry}
                  className="shrink-0 flex items-center gap-1 font-bold hover:text-red-300"
                >
                  <RotateCcw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-sm tracking-widest"
            isLoading={isSaving}
          >
            {isEdit ? "Save Changes" : "Add Hardware"}
          </Button>
        </form>
      </motion.aside>
    </>
  );
};

export default HardwareFormPanel;
