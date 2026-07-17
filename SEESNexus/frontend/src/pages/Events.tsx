import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  Zap,
  Loader2,
} from "lucide-react";
import { Event, EventType, RegistrationStatus } from "../types";
import { MOCK_EVENTS } from "../mocks/events";
import AppLayout from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { formatError } from "../utils/errorHelper";
import { getItemImage } from "../utils/imageHelper";
import eventService from "../services/eventService";
import toast from "react-hot-toast";

// Backend exposes no event status/registration-count field — derive the
// lifecycle state client-side from the dates it does give us.
const isPast = (event: Event) => new Date(event.end_date) < new Date();
const isRegistrationClosed = (event: Event) =>
  new Date(event.registration_deadline) < new Date();

const Events = () => {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Keyed by event id — backend auto-waitlists once max_participants is hit,
  // so "registered" isn't always the right label for what actually happened.
  const [registrations, setRegistrations] = useState<
    Record<string, RegistrationStatus>
  >({});

  const fetchEvents = useCallback(async () => {
    try {
      // Backend defaults to limit=10 when omitted — request its max so the
      // hub isn't silently missing events.
      const data = await eventService.getAll({ limit: 100 });
      setEvents(data);
    } catch (error) {
      // Falls back to MOCK_EVENTS below — silent, since the fallback already covers the user.
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = (events.length > 0 ? events : MOCK_EVENTS).filter(
    (event) => activeFilter === "ALL" || event.event_type === activeFilter,
  );

  const handleRegister = async (eventId: string) => {
    try {
      const registration = await eventService.register(eventId);
      toast.success(
        registration.status === RegistrationStatus.WAITLISTED
          ? "Event is full — you've been added to the waitlist."
          : "Access granted. You're registered.",
      );
      setRegistrations((prev) => ({ ...prev, [eventId]: registration.status }));
      fetchEvents();
    } catch (error) {
      toast.error(formatError(error, "Failed to register"));
    }
  };

  if (isLoading && events.length === 0) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Visual Flair */}
      <div className="absolute top-0 right-[20%] w-[1px] h-full bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />

      <div>
        <header className="mb-12 flex justify-between items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold tracking-widest uppercase">
              <Zap className="w-4 h-4 fill-emerald-500" />
              Nexus Protocol
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter">
              EVENT STREAM
            </h1>
            <p className="text-gray-500 text-sm max-w-lg border-l-2 border-emerald-500/30 pl-4 py-2 italic font-sans font-medium">
              Sync your schedule with the pulse of engineering innovation and
              ecosystem-wide collaboration events.
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-4xl font-black text-white/5 tracking-tighter uppercase leading-none">
              SEES_UNILAG
            </span>
            <span className="text-xs text-gray-600 font-bold uppercase tracking-[0.2em]">
              Established 2023
            </span>
          </div>
        </header>

        {/* Filter Navigation */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {["ALL", ...Object.values(EventType)].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    : "bg-white/5 text-gray-500 hover:text-white border border-white/5"
                }`}
              >
                {filter}
              </button>
            ),
          )}
        </div>

        {/* Events List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
              >
                <GlassCard className="group hover:bg-emerald-500/5 transition-all duration-500 flex flex-col xl:flex-row gap-6 p-0 overflow-hidden border-white/5">
                  <div className="xl:w-80 h-52 xl:h-auto overflow-hidden relative bg-emerald-900/20">
                    <div className="absolute inset-0 bg-emerald-500/20 group-hover:opacity-0 transition-opacity z-10" />
                    {/* Fallback behind image — shows when Pollinations fails or is slow */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="w-10 h-10 text-emerald-500/10" />
                    </div>
                    <img
                      src={
                        event.banner_url ||
                        getItemImage(
                          `${event.title} ${event.event_type.toLowerCase()} engineering students Nigeria`,
                          event.id,
                          600,
                          400,
                        )
                      }
                      alt={event.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 contrast-125"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <div className="bg-black/80 backdrop-blur-md px-3 py-1 flex flex-col items-center border border-emerald-500/50 shadow-lg">
                        <span className="text-[10px] font-bold text-emerald-500 leading-tight">
                          {new Date(event.start_date)
                            .toLocaleString("en-US", { month: "short" })
                            .toUpperCase()}
                        </span>
                        <span className="text-2xl font-black leading-tight text-white">
                          {new Date(event.start_date).getDate()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black text-emerald-400 rounded uppercase tracking-tighter shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          {event.event_type}
                        </span>
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-mono font-bold">
                          <Clock className="w-3 h-3 text-emerald-500/70" />
                          {new Date(event.start_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-sans font-medium italic">
                          <MapPin className="w-3 h-3 text-emerald-500/70" />
                          {event.location}
                        </div>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black italic tracking-tighter mb-3 group-hover:text-emerald-400 transition-colors uppercase">
                        {event.title}
                      </h3>
                      <p className="text-gray-400 text-sm italic font-sans leading-relaxed line-clamp-2 max-w-2xl mb-6">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                            <Users className="w-3 h-3 text-emerald-500" />
                            Capacity
                          </div>
                          <span className="text-sm font-black text-white italic">
                            {event.max_participants
                              ? `${event.max_participants} SLOTS`
                              : "UNLIMITED"}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="group/btn relative overflow-hidden px-8"
                        onClick={() => handleRegister(event.id)}
                        disabled={
                          !!registrations[event.id] ||
                          isPast(event) ||
                          isRegistrationClosed(event)
                        }
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {isPast(event)
                            ? "STREAM ARCHIVE"
                            : registrations[event.id] ===
                                RegistrationStatus.WAITLISTED
                              ? "WAITLISTED ✓"
                              : registrations[event.id]
                                ? "REGISTERED ✓"
                                : isRegistrationClosed(event)
                                  ? "REGISTRATION CLOSED"
                                  : "REQUEST ACCESS"}
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Timeline Sidebar Concept (Right Side Decoration) */}
        <div className="hidden 2xl:block absolute right-12 top-1/2 -translate-y-1/2 space-y-8 opacity-20 hover:opacity-100 transition-opacity">
          {[2023, 2024, 2025].map((year) => (
            <div
              key={year}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div className="h-[2px] w-12 bg-white/10 group-hover:w-20 group-hover:bg-emerald-500 transition-all duration-500" />
              <span className="text-4xl font-black tracking-tighter group-hover:text-emerald-400 transition-colors">
                {year}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Events;
