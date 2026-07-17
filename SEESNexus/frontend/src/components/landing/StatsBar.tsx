import React from "react";

interface Stat {
    label: string;
    value: string;
}

// Hardcoded for v1 — swap for /api/v1/admin/dashboard-stats once wired up
const PLACEHOLDER_STATS: Stat[] = [
    { label: "Active Projects", value: "42" },
    { label: "Network Nodes", value: "1.2k" },
    { label: "Inventory Units", value: "500+" },
    { label: "System Uptime", value: "99.9%" },
];

interface StatsBarProps {
    stats?: Stat[];
}

export const StatsBar: React.FC<StatsBarProps> = ({
    stats = PLACEHOLDER_STATS,
}) => {
    return (
        <section className="border-t border-sees-teal/20 bg-sees-forest/40 backdrop-blur-sees">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex flex-col gap-1 border-l-2 border-sees-mint/20 pl-4"
                    >
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                            {stat.label}
                        </span>
                        <span className="text-2xl font-black text-white">
                            {stat.value}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};
