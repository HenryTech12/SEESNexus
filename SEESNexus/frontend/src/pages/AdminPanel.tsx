import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Users as UsersIcon,
    Package,
    Trophy,
    Settings,
    AlertTriangle,
    CheckCircle,
    XCircle,
    MoreVertical,
    Download,
    Eye,
    Trash2,
    Calendar,
    Activity,
} from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";

type AdminTab =
    | "OVERVIEW"
    | "USERS"
    | "HARDWARE_LOANS"
    | "PROJECTS_REVIEW"
    | "EVENTS";

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>("OVERVIEW");

    return (
        <div className="flex min-h-screen bg-black text-white font-mono overflow-hidden">
            <Sidebar />

            <main className="flex-1 lg:ml-64 p-8 relative">
                {/* Security Overlay Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)]" />
                    <div className="w-full h-full bg-[repeating-linear-gradient(0deg,_transparent,_transparent_2px,_rgba(16,185,129,0.1)_3px)] bg-[length:100%_4px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10"
                >
                    <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 text-red-500 text-xs font-black tracking-[0.3em] mb-2">
                                <Shield className="w-4 h-4 fill-red-500/20" />
                                HIGH CLEARANCE ACCESS ONLY
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter">
                                ADMIN_COMMAND_CENTER
                            </h1>
                        </div>

                        <div className="flex gap-4">
                            <Button className="bg-white/5 border-white/10 hover:bg-white/10 text-xs py-2 px-6">
                                <Download className="w-4 h-4 mr-2" />
                                EXPORT_LOGS
                            </Button>
                            <Button className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-400 text-xs py-2 px-6">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                EMERGENCY_HALT
                            </Button>
                        </div>
                    </header>

                    {/* Tab Selection */}
                    <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded border border-white/10 w-fit">
                        {(
                            [
                                "OVERVIEW",
                                "USERS",
                                "HARDWARE_LOANS",
                                "PROJECTS_REVIEW",
                                "EVENTS",
                            ] as AdminTab[]
                        ).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 text-[10px] font-black transition-all duration-200 ${
                                    activeTab === tab
                                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                                        : "hover:bg-white/5 text-gray-500 hover:text-white"
                                }`}
                            >
                                {tab.replace("_", " ")}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "OVERVIEW" && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                <StatCard
                                    label="Total Users"
                                    value="1,248"
                                    delta="+12%"
                                    icon={<UsersIcon />}
                                />
                                <StatCard
                                    label="Active Loans"
                                    value="14"
                                    delta="-2"
                                    icon={<Package />}
                                />
                                <StatCard
                                    label="Pending Projects"
                                    value="8"
                                    delta="+3"
                                    icon={<Shield />}
                                />
                                <StatCard
                                    label="System Health"
                                    value="99.9%"
                                    delta="STABLE"
                                    icon={<Activity />}
                                />

                                <GlassCard className="col-span-full xl:col-span-3 p-6 border-white/5">
                                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-emerald-500" />
                                        LIVE_SYSTEM_TRAFFIC
                                    </h3>
                                    <div className="h-64 flex items-end gap-1">
                                        {[...Array(60)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-emerald-500/40 hover:bg-emerald-400 transition-colors"
                                                style={{
                                                    height: `${
                                                        Math.random() * 100
                                                    }%`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </GlassCard>

                                <GlassCard className="col-span-full xl:col-span-1 p-6 border-white/5">
                                    <h3 className="text-lg font-black mb-6">
                                        SECURITY_LOGS
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            {
                                                action: "Admin Login",
                                                user: "nx-admin-01",
                                                time: "2m ago",
                                            },
                                            {
                                                action: "Hardware Approved",
                                                user: "nx-mod-04",
                                                time: "15m ago",
                                            },
                                            {
                                                action: "New Registration",
                                                user: "nx-auth-srv",
                                                time: "1h ago",
                                            },
                                            {
                                                action: "Backup Completed",
                                                user: "sys-cron",
                                                time: "3h ago",
                                            },
                                        ].map((log, i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-emerald-500 font-bold">
                                                        {log.action}
                                                    </span>
                                                    <span className="text-gray-600 italic">
                                                        BY: {log.user}
                                                    </span>
                                                </div>
                                                <span className="text-gray-700 font-mono">
                                                    {log.time}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}

                        {activeTab === "HARDWARE_LOANS" && (
                            <motion.div
                                key="loans"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <GlassCard className="p-0 overflow-hidden border-white/5">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 text-[10px] font-black tracking-widest text-emerald-500/70 border-b border-white/10 uppercase">
                                                <th className="p-4">
                                                    REQUEST_ID
                                                </th>
                                                <th className="p-4">
                                                    USER_ENTITY
                                                </th>
                                                <th className="p-4">
                                                    HARDWARE_UNIT
                                                </th>
                                                <th className="p-4">
                                                    LOAN_PERIOD
                                                </th>
                                                <th className="p-4">STATUS</th>
                                                <th className="p-4">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs">
                                            {[
                                                {
                                                    id: "LN-904",
                                                    user: "Toluwalashe A.",
                                                    item: "Jetson Nano",
                                                    date: "3 Days",
                                                    status: "PENDING",
                                                },
                                                {
                                                    id: "LN-903",
                                                    user: "Emmanuel O.",
                                                    item: "Li-Po Batteries (3x)",
                                                    date: "7 Days",
                                                    status: "PENDING",
                                                },
                                                {
                                                    id: "LN-901",
                                                    user: "Chizoba E.",
                                                    item: "Tektronix Scope",
                                                    date: "2 Days",
                                                    status: "APPROVED",
                                                },
                                            ].map((loan, i) => (
                                                <tr
                                                    key={i}
                                                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <td className="p-4 font-bold text-gray-500">
                                                        #{loan.id}
                                                    </td>
                                                    <td className="p-4">
                                                        {loan.user}
                                                    </td>
                                                    <td className="p-4 font-bold italic text-emerald-400">
                                                        {loan.item}
                                                    </td>
                                                    <td className="p-4 text-gray-400">
                                                        {loan.date}
                                                    </td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`px-2 py-1 rounded text-[10px] font-black ${
                                                                loan.status ===
                                                                "PENDING"
                                                                    ? "bg-yellow-500/20 text-yellow-500"
                                                                    : "bg-emerald-500/20 text-emerald-400"
                                                            }`}
                                                        >
                                                            {loan.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            <button className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded transition-colors">
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded transition-colors border border-red-500/30">
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-1.5 hover:bg-white/10 text-gray-400 rounded transition-colors">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

const StatCard = ({
    label,
    value,
    delta,
    icon,
}: {
    label: string;
    value: string;
    delta: string;
    icon: React.ReactNode;
}) => (
    <GlassCard className="p-5 border-white/5 hover:border-emerald-500/30 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span
                className={`text-[10px] font-black ${
                    delta.startsWith("+") ? "text-emerald-500" : "text-red-500"
                }`}
            >
                {delta}
            </span>
        </div>
        <div className="flex flex-col">
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
                {label}
            </span>
            <span className="text-3xl font-black italic tracking-tighter">
                {value}
            </span>
        </div>
    </GlassCard>
);

export default AdminPanel;
