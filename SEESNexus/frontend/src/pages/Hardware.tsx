import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Cpu, Info, AlertCircle, Loader2 } from "lucide-react";
import type { Hardware } from "../types";
import { HardwareCategory } from "../types";
import { MOCK_HARDWARE } from "../mocks/hardware";
import AppLayout from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import HardwareInspectorPanel from "../components/hardware/HardwareInspectorPanel";
import { getItemImage } from "../utils/imageHelper";
import hardwareService from "../services/hardwareService";
import toast from "react-hot-toast";

const CATEGORIES = ["All", ...Object.values(HardwareCategory)];

const Hardware = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hardware, setHardware] = useState<Hardware[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Hardware | null>(null);

  // Extracted so onLoanSuccess can call it to refresh the grid after a submission.
  const fetchHardware = useCallback(async () => {
    try {
      // Backend defaults to limit=10 when omitted — request its max so the
      // lab isn't silently missing inventory.
      const data = await hardwareService.getAll({ limit: 100 });
      setHardware(data);
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHardware();
  }, [fetchHardware]);

  const handleLoanSuccess = () => {
    setSelectedItem(null);
    fetchHardware();
  };

  const filteredHardware = (
    hardware.length > 0 ? hardware : MOCK_HARDWARE
  ).filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading && hardware.length === 0) {
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
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] -z-10" />

      <div>
        <header className="mb-10">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2 flex items-center gap-3">
            <Cpu className="w-7 h-7 md:w-10 md:h-10 text-emerald-400" />
            HARDWARE LABORATORY
          </h1>
          <p className="text-gray-400 max-w-2xl border-l-2 border-emerald-500/50 pl-4 py-1">
            Access the experimental inventory of SEES. Reserve high-end
            components for your engineering projects and research.
          </p>
        </header>

        <GlassCard className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="SEARCH COMPONENT ARCHIVE..."
                className="w-full bg-black/40 border border-emerald-500/20 rounded-md py-2 pl-10 pr-4 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 shrink-0">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
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
                  <div className="relative h-40 overflow-hidden bg-emerald-900/20">
                    {/* Fallback always rendered behind — visible when image fails or is slow */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu className="w-10 h-10 text-emerald-500/10" />
                    </div>
                    <img
                      src={
                        item.image_url ||
                        getItemImage(
                          `${item.name} ${item.category} electronic component engineering laboratory`,
                          item.id,
                          400,
                          240,
                        )
                      }
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
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
                      <span className="text-gray-500 truncate max-w-[120px]">
                        ID: NX-{item.id.slice(0, 6).toUpperCase()}
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
                              item.quantity > 0
                                ? (item.available_quantity / item.quantity) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold">
                        {item.available_quantity}/{item.quantity} UNITS
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 py-2 text-xs"
                        disabled={item.available_quantity === 0}
                        onClick={() => setSelectedItem(item)}
                      >
                        {item.available_quantity === 0
                          ? "NOT AVAILABLE"
                          : "REQUEST LOAN"}
                      </Button>
                      <button
                        className="p-2 border border-white/10 rounded-md hover:bg-white/5 transition-colors"
                        onClick={() => setSelectedItem(item)}
                      >
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
      </div>

      <AnimatePresence>
        {selectedItem && (
          <HardwareInspectorPanel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onLoanSuccess={handleLoanSuccess}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Hardware;
