import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    ChevronRight,
    Zap,
    Trophy,
    Terminal,
    Search,
    Filter,
    Loader2,
} from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { formatError } from "../utils/errorHelper";
import api from "../api/axios";
import toast from "react-hot-toast";

interface Event {
    id: string;
    title: string;
    type: "WORKSHOP" | "COMPETITION" | "SEMINAR" | "HACKATHON";
    description: string;
    event_date: string;
    location: string;
    capacity: number;
    current_attendees: number;
    image_url?: string;
    status: "UPCOMING" | "ONGOING" | "COMPLETED";
}

const EVENT_DATA: Event[] = [
    {
        id: "1",
        title: "Neural Network Workshop",
        type: "WORKSHOP",
        event_date: "2023-10-24T14:00:00Z",
        location: "Systems Lab 1",
        description:
            "Deep dive into building and training neural networks from scratch using PyTorch.",
        current_attendees: 42,
        capacity: 50,
        image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400",
        status: "UPCOMING",
    },
    {
        id: "2",
        title: "NexGen Hackathon 2.0",
        type: "HACKATHON",
        event_date: "2023-11-12T00:00:00Z",
        location: "Main Engineering Hall",
        description:
            "The flagship SEES Hackathon. Build innovative solutions for Nigerias energy sector.",
        current_attendees: 120,
        capacity: 150,
        image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400",
        status: "UPCOMING",
    },
    {
        id: "3",
        title: "Clean Energy Seminar",
        type: "SEMINAR",
        event_date: "2023-10-15T10:00:00Z",
        location: "Virtual Zoom",
        description:
            "Industry experts discuss the future of renewable energy integration in Africa.",
        current_attendees: 85,
        capacity: 100,
        image_url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400",
        status: "ONGOING",
    },
];

const Events = () => {
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get("/events");
                setEvents(response.data.data);
            } catch (error) {
                console.error("Failed to fetch events:", error);
                toast.error("Failed to load events");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = (events.length > 0 ? events : EVENT_DATA).filter(
        (event) => activeFilter === "ALL" || event.type === activeFilter
    );

    const handleRegister = async (eventId: string) => {
        try {
            await api.post(`/events/${eventId}/register`);
            toast.success("Successfully registered for event!");
            // Refresh events
            const response = await api.get("/events");
            setEvents(response.data.data);
        } catch (error: any) {
            toast.error(formatError(error, "Failed to register"));
        }
    };

    if (isLoading && events.length === 0) {
        return (
            <div className="flex bg-black min-h-screen font-mono">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-black text-white font-mono overflow-hidden">
            <Sidebar />

            <main className="flex-1 lg:ml-64 p-8 relative">
                {/* Visual Flair */}
                <div className="absolute top-0 right-[20%] w-[1px] h-full bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header className="mb-12 flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold tracking-widest uppercase">
                                <Zap className="w-4 h-4 fill-emerald-500" />
                                Nexus Protocol
                            </div>
                            <h1 className="text-5xl font-black italic tracking-tighter">
                                EVENT_STREAM
                            </h1>
                            <p className="text-gray-500 text-sm max-w-lg border-l-2 border-emerald-500/30 pl-4 py-2 italic font-sans font-medium">
                                Sync your schedule with the pulse of engineering
                                innovation and ecosystem-wide collaboration
                                events.
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
                        {[
                            "ALL",
                            "WORKSHOP",
                            "HACKATHON",
                            "SEMINAR",
                            "COMPETITION",
                        ].map((filter) => (
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
                        ))}
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
                                        <div className="xl:w-80 h-52 xl:h-auto overflow-hidden relative">
                                            <div className="absolute inset-0 bg-emerald-500/20 group-hover:opacity-0 transition-opacity z-10" />
                                            <img
                                                src={event.image_url || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400"}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 contrast-125"
                                            />
                                            <div className="absolute top-4 left-4 z-20">
                                                <div className="bg-black/80 backdrop-blur-md px-3 py-1 flex flex-col items-center border border-emerald-500/50 shadow-lg">
                                                    <span className="text-[10px] font-bold text-emerald-500 leading-tight">
                                                        {new Date(event.event_date || Date.now()).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                                                    </span>
                                                    <span className="text-2xl font-black leading-tight text-white">
                                                        {new Date(event.event_date || Date.now()).getDate()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-4 mb-3">
                                                    <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black text-emerald-400 rounded uppercase tracking-tighter shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                        {event.type}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-gray-500 text-xs font-mono font-bold">
                                                        <Clock className="w-3 h-3 text-emerald-500/70" />
                                                        {new Date(event.event_date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500 text-xs font-sans font-medium italic">
                                                        <MapPin className="w-3 h-3 text-emerald-500/70" />
                                                        {event.location}
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-black italic tracking-tighter mb-3 group-hover:text-emerald-400 transition-colors uppercase">
                                                    {event.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm italic font-sans leading-relaxed line-clamp-2 max-w-2xl mb-6">
                                                    {event.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                                            <Users className="w-3 h-3 text-emerald-500" />
                                                            Registry
                                                        </div>
                                                        <span className="text-sm font-black text-white italic">
                                                            {event.current_attendees || 0}/{event.capacity} OPERATIVES
                                                        </span>
                                                    </div>
                                                </div>

                                                <Button
                                                    size="sm"
                                                    className="group/btn relative overflow-hidden px-8"
                                                    onClick={() => handleRegister(event.id)}
                                                    disabled={event.current_attendees >= event.capacity || event.status === "COMPLETED"}
                                                >
                                                    <span className="relative z-10 flex items-center gap-2">
                                                        {event.status === "COMPLETED" ? "STREAM ARCHIVE" : "REQUEST ACCESS"}
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
                </motion.div>
            </main>
        </div>
    );
};

export default Events;
