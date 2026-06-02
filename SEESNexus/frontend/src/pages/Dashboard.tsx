import React from "react";
import { Sidebar } from "../components/layout/Sidebar";
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

const data = [
    { name: "Mon", active: 400 },
    { name: "Tue", active: 300 },
    { name: "Wed", active: 600 },
    { name: "Thu", active: 800 },
    { name: "Fri", active: 500 },
    { name: "Sat", active: 900 },
    { name: "Sun", active: 700 },
];

const stats = [
    {
        label: "Total Projects",
        value: "47",
        icon: Rocket,
        trend: "+3 this week",
        color: "text-sees-mint",
    },
    {
        label: "Active Loans",
        value: "12",
        icon: Cpu,
        trend: "4 returning soon",
        color: "text-sees-mustard",
    },
    {
        label: "Upcoming Events",
        value: "8",
        icon: Calendar,
        trend: "2 starting tomorrow",
        color: "text-blue-400",
    },
];

export const Dashboard = () => {
    return (
        <div className="flex bg-sees-void min-h-screen">
            <Sidebar />

            <main className="flex-1 ml-72 p-8 pt-12 space-y-8">
                <header className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">
                            Command Center
                        </h1>
                        <p className="text-sees-mint/60">
                            Greetings, Engineer. System status is operational.
                        </p>
                    </div>
                    <div className="flex gap-4">
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
                                    <h3 className="text-4xl font-black text-white leading-none">
                                        {stat.value}
                                    </h3>
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
                                <AreaChart data={data}>
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

                    {/* Activity Feed */}
                    <GlassCard className="border-sees-mint/10 flex flex-col">
                        <h4 className="text-lg font-black text-white mb-6">
                            Recent Activity
                        </h4>
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                            {[
                                {
                                    type: "loan",
                                    msg: "Henry requested Oscilloscope",
                                    time: "2m ago",
                                    icon: Clock,
                                },
                                {
                                    type: "event",
                                    msg: "New Hackathon registration",
                                    time: "15m ago",
                                    icon: Calendar,
                                },
                                {
                                    type: "project",
                                    msg: "BAER System status: Completed",
                                    time: "1h ago",
                                    icon: CheckCircle2,
                                },
                                {
                                    type: "user",
                                    msg: "Adaeze joined the Hub",
                                    time: "3h ago",
                                    icon: TrendingUp,
                                },
                            ].map((activity, i) => (
                                <div
                                    key={i}
                                    className="flex gap-4 group cursor-default"
                                >
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-sees-forest/60 border border-sees-mint/20 flex items-center justify-center text-sees-mint">
                                            <activity.icon size={14} />
                                        </div>
                                        {i !== 3 && (
                                            <div className="absolute top-8 left-1/2 w-px h-10 bg-sees-mint/10 -translate-x-1/2" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-sees-mint transition-colors">
                                            {activity.msg}
                                        </p>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-sees-mint/30">
                                            {activity.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-sees-mint hover:text-white transition-colors text-center py-2 border border-sees-mint/10 rounded group">
                            View All Logs{" "}
                            <ArrowUpRight
                                size={12}
                                className="inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                            />
                        </button>
                    </GlassCard>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
