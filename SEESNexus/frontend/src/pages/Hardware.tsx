import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Cpu,
    Battery,
    Radio,
    Wrench,
    Filter,
    Plus,
    Info,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { formatError } from "../utils/errorHelper";
import api from "../api/axios";
import toast from "react-hot-toast";

interface HardwareItem {
    id: string;
    name: string;
    category: string;
    description: string;
    available_quantity: number;
    total_quantity: number;
    image_url?: string;
    status: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
}

const HARDWARE_DATA: HardwareItem[] = [
    {
        id: "1",
        name: "Arduino Uno R3",
        category: "Microcontrollers",
        description:
            "Atmega328P microcontroller, perfect for basic electronics and prototyping.",
        available_quantity: 12,
        total_quantity: 15,
        image_url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=200",
        status: "AVAILABLE",
    },
    {
        id: "2",
        name: "Raspberry Pi 4 Model B",
        category: "SBC",
        description:
            "8GB RAM Quad-core 64-bit ARM CPU. High performance embedded computing.",
        available_quantity: 0,
        total_quantity: 5,
        image_url: "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=200",
        status: "OUT_OF_STOCK",
    },
    {
        id: "3",
        name: "Digital Oscilloscope",
        category: "Testing Equipment",
        description:
            "100MHz Dual Channel digital storage oscilloscope for signal analysis.",
        available_quantity: 2,
        total_quantity: 3,
        image_url: "https://images.unsplash.com/photo-1551046544-3ef0b8e617d1?auto=format&fit=crop&q=80&w=200",
        status: "LOW_STOCK",
    },
    {
        id: "4",
        name: "Lidar Sensor V4",
        category: "Sensors",
        description:
            "Time-of-flight optical distance sensor for robotics and mapping.",
        available_quantity: 8,
        total_quantity: 10,
        image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200",
        status: "AVAILABLE",
    },
];

const CATEGORIES = [
    "All",
    "Microcontrollers",
    "SBC",
    "Sensors",
    "Testing Equipment",
    "Actuators",
];

const Hardware = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [hardware, setHardware] = useState<HardwareItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHardware = async () => {
            try {
                const response = await api.get("/hardware");
                setHardware(response.data.data);
            } catch (error) {
                console.error("Failed to fetch hardware:", error);
                toast.error("Failed to load inventory");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHardware();
    }, []);

    const filteredHardware = hardware.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleLoanRequest = async (itemId: string) => {
        try {
            await api.post("/hardware/loans", {
                hardware_id: itemId,
                quantity: 1,
                reason: "Project development",
                return_date: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
            });
            toast.success("Loan request submitted successfully!");
            // Refresh inventory
            const response = await api.get("/hardware");
            setHardware(response.data.data);
        } catch (error: any) {
            toast.error(formatError(error, "Failed to submit request"));
        }
    };

    if (isLoading && hardware.length === 0) {
        return (
            <div className="flex h-screen bg-black text-white font-mono">
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
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 blur-[150px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header className="mb-10">
                        <h1 className="text-4xl font-bold tracking-tighter mb-2 flex items-center gap-3">
                            <Cpu className="w-10 h-10 text-emerald-400" />
                            HARDWARE LABORATORY
                        </h1>
                        <p className="text-gray-400 max-w-2xl border-l-2 border-emerald-500/50 pl-4 py-1">
                            Access the experimental inventory of SEES. Reserve
                            high-end components for your engineering projects
                            and research.
                        </p>
                    </header>

                    {/* Filter Bar */}
                    <GlassCard className="mb-8 p-4 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH COMPONENT ARCHIVE..."
                                className="w-full bg-black/40 border border-emerald-500/20 rounded-md py-2 pl-10 pr-4 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    onClick={() =>
                                        setSelectedCategory(category)
                                    }
                                    className={`px-4 py-1.5 rounded-md text-xs whitespace-nowrap transition-all ${
                                        selectedCategory === category
                                            ? "bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                            : "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
                                    }`}
                                >
                                    {category.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Hardware Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredHardware.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.05,
                                    }}
                                >
                                    <GlassCard className="h-full group hover:border-emerald-500/50 transition-all duration-500 overflow-hidden">
                                        <div className="relative h-40 overflow-hidden">
                                            <img
                                                src={item.image_url || "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=200"}
                                                alt={item.name}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                            <div className="absolute top-3 right-3">
                                                <span
                                                    className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                                        item.available_quantity > 5
                                                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                                            : item.available_quantity > 0
                                                            ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                                                            : "bg-red-500/20 text-red-500 border-red-500/50"
                                                    }`}
                                                >
                                                    {item.available_quantity > 5
                                                        ? "AVAILABLE"
                                                        : item.available_quantity > 0
                                                        ? "LOW STOCK"
                                                        : "OUT OF STOCK"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2 text-xs">
                                                <span className="text-emerald-500 font-bold">
                                                    {item.category}
                                                </span>
                                                <span className="text-gray-500">
                                                    ID: NX-
                                                    {item.id.padStart(3, "0")}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                                                {item.name}
                                            </h3>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2 italic">
                                                "{item.description}"
                                            </p>

                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${
                                                            item.available_quantity > 5
                                                                ? "bg-emerald-500"
                                                                : item.available_quantity > 0
                                                                ? "bg-yellow-500"
                                                                : "bg-red-500"
                                                        }`}
                                                        style={{
                                                            width: `${
                                                                (item.available_quantity /
                                                                    item.total_quantity) *
                                                                100
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono font-bold">
                                                    {item.available_quantity}/
                                                    {item.total_quantity} UNITS
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1 py-2 text-xs"
                                                    disabled={
                                                        item.available_quantity === 0
                                                    }
                                                    onClick={() => handleLoanRequest(item.id)}
                                                >
                                                    {item.available_quantity === 0
                                                        ? "NOT AVAILABLE"
                                                        : "REQUEST LOAN"}
                                                </Button>
                                                <button className="p-2 border border-white/10 rounded-md hover:bg-white/5 transition-colors">
                                                    <Info className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredHardware.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-xl">
                            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400 font-mono">
                                NO COMPONENTS MATCHING YOUR SEARCH PARAMETERS
                            </p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default Hardware;
