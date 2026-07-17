import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, ImageIcon, Loader2, RotateCcw } from "lucide-react";
import type { Event } from "../../types";
import { EventType } from "../../types";
import eventService from "../../services/eventService";
import { useImageUpload } from "../../hooks/useImageUpload";
import { Button } from "../ui/Button";
import { formatError } from "../../utils/errorHelper";
import toast from "react-hot-toast";

interface Props {
  item?: Event | null;
  onClose: () => void;
  onSaved: () => void;
}

// datetime-local inputs need "YYYY-MM-DDTHH:mm" in LOCAL time, with no
// timezone designator. toISOString() would return UTC instead, which is a
// different wall-clock time everywhere except UTC+0 — pre-filling with it
// silently shifts the date by the browser's UTC offset the moment the form
// is saved again, even if the user never touches the date fields.
const toDatetimeLocal = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EventFormPanel: React.FC<Props> = ({ item, onClose, onSaved }) => {
  const isEdit = !!item;

  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [eventType, setEventType] = useState<EventType>(
    item?.event_type || EventType.WORKSHOP,
  );
  const [location, setLocation] = useState(item?.location || "");
  const [isVirtual, setIsVirtual] = useState(item?.is_virtual || false);
  const [virtualLink, setVirtualLink] = useState(item?.virtual_link || "");
  const [startDate, setStartDate] = useState(
    toDatetimeLocal(item?.start_date),
  );
  const [endDate, setEndDate] = useState(toDatetimeLocal(item?.end_date));
  const [registrationDeadline, setRegistrationDeadline] = useState(
    toDatetimeLocal(item?.registration_deadline),
  );
  const [maxParticipants, setMaxParticipants] = useState(
    item?.max_participants?.toString() || "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const image = useImageUpload(item?.banner_url || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      toast.error("Title, description, and location are required");
      return;
    }
    if (!startDate || !endDate || !registrationDeadline) {
      toast.error("Start date, end date, and registration deadline are required");
      return;
    }
    if (isVirtual && !virtualLink.trim()) {
      toast.error("Virtual link is required for a virtual event");
      return;
    }
    if (image.isPending) {
      toast.error(
        image.error
          ? "Banner failed to upload — retry or remove it before saving"
          : "Banner is still uploading — please wait",
      );
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      event_type: eventType,
      location: location.trim(),
      is_virtual: isVirtual,
      virtual_link: isVirtual ? virtualLink.trim() : undefined,
      banner_url: image.confirmedUrl || undefined,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      registration_deadline: new Date(registrationDeadline).toISOString(),
      max_participants: maxParticipants ? Number(maxParticipants) : undefined,
    };

    setIsSaving(true);
    try {
      if (item) {
        await eventService.update(item.id, payload);
        toast.success("Event updated");
      } else {
        await eventService.create(payload);
        toast.success("Event created");
      }
      onSaved();
    } catch (err) {
      toast.error(formatError(err, "Failed to save event"));
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
            {isEdit ? "Edit Event" : "Add Event"}
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
              Title
            </label>
            <input
              type="text"
              className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Type
            </label>
            <select
              className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
            >
              {Object.values(EventType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Location
            </label>
            <input
              type="text"
              className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider cursor-pointer">
            <input
              type="checkbox"
              checked={isVirtual}
              onChange={(e) => setIsVirtual(e.target.checked)}
              className="accent-emerald-500"
            />
            Virtual Event
          </label>

          {isVirtual && (
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Virtual Link
              </label>
              <input
                type="text"
                placeholder="https://..."
                className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                value={virtualLink}
                onChange={(e) => setVirtualLink(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Start
              </label>
              <input
                type="datetime-local"
                className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                End
              </label>
              <input
                type="datetime-local"
                className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Max Participants
            </label>
            <input
              type="number"
              min={1}
              placeholder="Leave blank for unlimited"
              className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Banner
            </label>
            <input
              id="event-image-input"
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
                document.getElementById("event-image-input")?.click()
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
                  alt="Banner preview"
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
            {isEdit ? "Save Changes" : "Add Event"}
          </Button>
        </form>
      </motion.aside>
    </>
  );
};

export default EventFormPanel;
