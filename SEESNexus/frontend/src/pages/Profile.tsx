import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";
import { User, Shield, Package, Clock, LogOut, ChevronRight, Activity } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Profile = () => {
    const { user, logout } = useAuthStore();
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // In a real app, we'd fetch specific user loans
                // For now, we'll fetch all hardware to simulate data
                const response = await api.get("/hardware/");
                setLoans(response.data.data.hardware?.slice(0, 3) || []);
            } catch (error) {
                console.error("Failed to fetch user history");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, []);

    return (
        <div className="flex min-h-screen bg-black text-white font-mono overflow-hidden">
            <Sidebar />

            <main className="flex-1 lg:ml-64 p-8 relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                
                <div className="max-w-4xl mx-auto pt-10">
                    <div className="flex items-end gap-6 mb-12">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center overflow-hidden">
                                {user?.full_name ? (
                                    <span className="text-4xl font-black text-emerald-500 italic">
                                        {user.full_name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                ) : (
                                    <User size={48} className="text-emerald-500/50" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-black border border-emerald-500/50 p-2 rounded-lg text-emerald-500">
                                <Shield size={16} />
                            </div>
                        </div>

                        <div className="flex-1 pb-2">
                            <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-black tracking-[0.3em] mb-2 uppercase">
                                <Activity size={12} className="animate-pulse" />
                                Profile_Authorized
                            </div>
                            <h1 className="text-5xl font-black italic tracking-tighter mb-2">
                                {user?.full_name?.toUpperCase() || "OPERATOR"}
                            </h1>
                            <p className="text-gray-500 text-xs font-bold flex items-center gap-2">
                                {user?.email} <span className="w-1 h-1 bg-gray-700 rounded-full" /> LEVEL_01_ACCESS
                            </p>
                        </div>

                        <Button 
                            onClick={logout}
                            variant="ghost" 
                            className="mb-2 border-red-500/20 text-red-500 hover:bg-red-500/10"
                        >
                            <LogOut size={16} className="mr-2" /> TERMINATE_SESSION
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[
                            { label: "ASSETS_ON_LOAN", value: "03", icon: Package },
                            { label: "PROTOCOL_STATUS", value: "ACTIVE", icon: Shield },
                            { label: "UPTIME", value: "152H", icon: Clock },
                        ].map((stat, i) => (
                            <GlassCard key={i} className="p-4 border-emerald-500/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <stat.icon size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-gray-500 tracking-widest">{stat.label}</span>
                                </div>
                                <div className="text-2xl font-black italic">{stat.value}</div>
                            </GlassCard>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <header className="flex justify-between items-center">
                            <h2 className="text-sm font-black italic tracking-widest text-emerald-500 uppercase">Deployed_Assets_History</h2>
                            <div className="h-px flex-1 mx-6 bg-emerald-500/10" />
                        </header>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => <div key={i} className="h-20 bg-emerald-500/5 rounded-xl animate-pulse" />)}
                            </div>
                        ) : loans.length > 0 ? (
                            <div className="space-y-3">
                                {loans.map((loan: any, i) => (
                                    <GlassCard key={i} className="p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-black border border-emerald-500/20 rounded-lg flex items-center justify-center">
                                                <Package size={20} className="text-emerald-500/40" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black italic">{loan.name}</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                                    ID: {loan.id.slice(0, 8)} • RETURN_BY: 2024-05-20
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">ON_LOAN</span>
                                            <ChevronRight size={16} className="text-gray-700 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        ) : (
                            <GlassCard className="p-12 border-dashed border-emerald-500/20 text-center">
                                <Package size={32} className="mx-auto text-gray-800 mb-4" />
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No active deployments found in archive</p>
                            </GlassCard>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
