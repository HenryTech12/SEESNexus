import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import {
    Rocket,
    Cpu,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    Clock,
    CheckCircle2,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import hardwareService from "../services/hardwareService";
import projectService from "../services/projectService";
import eventService from "../services/eventService";
import type { HardwareLoan } from "../types";

// No time-series endpoint exists yet — chart is decorative until backend provides aggregation
const chartData = [
    { name: "Mon", active: 400 },
    { name: "Tue", active: 300 },
    { name: "Wed", active: 600 },
    { name: "Thu", active: 800 },
    { name: "Fri", active: 500 },
    { name: "Sat", active: 900 },
    { name: "Sun", active: 700 },
];

const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

export const Dashboard = () => {
    const [projectCount, setProjectCount] = useState<number | null>(null);
    const [activeLoanCount, setActiveLoanCount] = useState<number | null>(null);
    const [upcomingEventCount, setUpcomingEventCount] = useState<number | null>(null);
    const [recentLoans, setRecentLoans] = useState<HardwareLoan[]>([]);

    useEffect(() => {
        // allSettled so one failing endpoint doesn't blank the whole dashboard;
        // always resolve to a number so spinners don't hang when backend is down.
        // limit: 100 — backend defaults to 10, which would undercount these stats.
        Promise.allSettled([
            projectService.getAll({ limit: 100 }),
            hardwareService.getMyLoans(),
            eventService.getAll({ upcoming_only: true, limit: 100 }),
        ]).then(([projectsResult, loansResult, eventsResult]) => {
            setProjectCount(
                projectsResult.status === "fulfilled"
                    ? projectsResult.value.length
                    : 0,
            );

            if (loansResult.status === "fulfilled") {
                const loans = loansResult.value;
                setActiveLoanCount(
                    loans.filter(
                        (l) => l.status === "APPROVED" || l.status === "PENDING",
                    ).length,
                );
                setRecentLoans(loans.slice(0, 4));
            } else {
                setActiveLoanCount(0);
            }

            setUpcomingEventCount(
                eventsResult.status === "fulfilled"
                    ? eventsResult.value.length
                    : 0,
            );
        });
    }, []);

    const stats = [
        {
            label: "Total Projects",
            value: projectCount,
            icon: Rocket,
            trend: "Innovation Gallery",
            color: "text-sees-mint",
        },
        {
            label: "Active Loans",
            value: activeLoanCount,
            icon: Cpu,
            trend:
                activeLoanCount === null
                    ? "—"
                    : activeLoanCount > 0
                      ? `${activeLoanCount} in progress`
                      : "None active",
            color: "text-sees-mustard",
        },
        {
            label: "Upcoming Events",
            value: upcomingEventCount,
            icon: Calendar,
            trend: "Events Hub",
            color: "text-blue-400",
        },
    ];

    return (
        <AppLayout className="bg-sees-void font-mono overflow-hidden">
            <div className="pt-4 space-y-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-8">
                    <div>
                        <p className="text-[10px] font-black text-sees-mint/40 uppercase tracking-[0.3em] mb-2">
                            SEES_NEXUS / DASHBOARD
                        </p>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2 uppercase">
                            Command Center
                        </h1>
                        <p className="text-sees-mint/60 text-sm">
                            Greetings, Engineer. System status is operational.
                        </p>
                    </div>
                    <div className="hidden sm:flex gap-4 shrink-0">
                        <GlassCard className="!py-2 !px-4 border-sees-mint/20 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-sees-mint animate-pulse shadow-glow-mint" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-sees-mint">
                                Live Connection
                            </span>
                        </GlassCard>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <GlassCard
                            key={stat.label}
                            hoverGlow
                            className="border-sees-mint/10"
                        >
                            <div className="flex justify-between items-start">
                                <div
                                    className={`p-3 rounded-xl bg-sees-forest/40 ${stat.color}`}
                                >
                                    <stat.icon size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-sees-mint bg-sees-mint/10 px-2 py-1 rounded">
                                    <TrendingUp size={12} /> {stat.trend}
                                </div>
                            </div>
                            <div className="mt-6">
                                <p className="text-sees-mint/40 text-xs font-bold uppercase tracking-[0.2em] mb-1">
                                    {stat.label}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    {stat.value !== null ? (
                                        <h3 className="text-4xl font-black text-white leading-none">
                                            {stat.value}
                                        </h3>
                                    ) : (
                                        <span className="w-8 h-8 border-2 border-sees-mint/20 border-t-sees-mint rounded-full animate-spin inline-block" />
                                    )}
                                    <ArrowUpRight
                                        size={20}
                                        className="text-sees-mint/30"
                                    />
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart Area */}
                    <GlassCard className="lg:col-span-2 border-sees-mint/10 !p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h4 className="text-lg font-black text-white">
                                    Innovation Metrics
                                </h4>
                                <p className="text-xs text-sees-mint/40">
                                    Platform engagement over the last 7 days
                                </p>
                            </div>
                            <select className="bg-sees-void border border-sees-mint/20 rounded px-3 py-1 text-xs text-sees-mint font-bold outline-none">
                                <option>Weekly View</option>
                                <option>Monthly View</option>
                            </select>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient
                                            id="colorActive"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#A7FFEB"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#A7FFEB"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#004D40"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#004D40"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#A7FFEB", opacity: 0.5 }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#000F0D",
                                            border: "1px solid #004D40",
                                            borderRadius: "8px",
                                        }}
                                        itemStyle={{
                                            color: "#A7FFEB",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="active"
                                        stroke="#A7FFEB"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorActive)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Activity Feed — driven by the current user's loan history */}
                    <GlassCard className="border-sees-mint/10 flex flex-col">
                        <h4 className="text-lg font-black text-white mb-6">
                            Recent Activity
                        </h4>
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                            {recentLoans.length > 0 ? (
                                recentLoans.map((loan, i) => (
                                    <div
                                        key={loan.id}
                                        className="flex gap-4 group cursor-default"
                                    >
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-sees-forest/60 border border-sees-mint/20 flex items-center justify-center text-sees-mint">
                                                {loan.status === "RETURNED" ? (
                                                    <CheckCircle2 size={14} />
                                                ) : (
                                                    <Clock size={14} />
                                                )}
                                            </div>
                                            {i !== recentLoans.length - 1 && (
                                                <div className="absolute top-8 left-1/2 w-px h-10 bg-sees-mint/10 -translate-x-1/2" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-sees-mint transition-colors line-clamp-1">
                                                Loan {loan.status.toLowerCase()}:{" "}
                                                {loan.purpose}
                                            </p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-sees-mint/30">
                                                {timeAgo(loan.request_date)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex items-center justify-center py-8">
                                    <p className="text-xs text-sees-mint/20 uppercase tracking-widest font-bold text-center">
                                        No loan activity yet
                                    </p>
                                </div>
                            )}
                        </div>
                        <Link
                            to="/profile"
                            className="mt-8 block text-[10px] font-black uppercase tracking-[0.2em] text-sees-mint hover:text-white transition-colors text-center py-2 border border-sees-mint/10 rounded group"
                        >
                            View Full History{" "}
                            <ArrowUpRight
                                size={12}
                                className="inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                            />
                        </Link>
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
