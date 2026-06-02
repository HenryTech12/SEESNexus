import React from "react";
import { NavLink } from "react-router-dom";
import {
    BarChart3,
    Rocket,
    Cpu,
    Calendar,
    User,
    Settings,
    LogOut,
    QrCode,
    LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Rocket, label: "Innovation Gallery", path: "/projects" },
    { icon: Cpu, label: "Hardware Lab", path: "/hardware" },
    { icon: Calendar, label: "Events Hub", path: "/events" },
    { icon: QrCode, label: "QR Scanner", path: "/hardware/scan" },
    { icon: User, label: "My Profile", path: "/profile" },
];

const adminItems = [
    { icon: Settings, label: "Admin Panel", path: "/admin" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

export const Sidebar = () => {
    const { user, logout } = useAuthStore();
    const role = user?.role;

    return (
        <aside className="w-72 h-screen bg-sees-forest/40 border-r border-sees-mint/10 flex flex-col fixed left-0 top-0 z-40 backdrop-blur-xl">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sees-mint rounded-lg flex items-center justify-center font-black text-sees-void shadow-glow-mint">
                        SN
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white leading-none">
                            SEES
                        </h1>
                        <p className="text-[10px] text-sees-mint/60 uppercase tracking-[0.2em]">
                            Nexus Hub
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                <div className="mb-6">
                    <p className="px-4 text-[10px] font-black text-sees-mint/30 uppercase tracking-[0.2em] mb-4">
                        Navigations
                    </p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-lg transition-all group
                ${
                    isActive
                        ? "bg-sees-mint text-sees-void shadow-glow-mint"
                        : "text-sees-mint/60 hover:text-sees-mint hover:bg-sees-mint/5"
                }
              `}
                        >
                            <item.icon size={20} />
                            <span className="font-bold text-sm">
                                {item.label}
                            </span>
                        </NavLink>
                    ))}
                </div>

                {role === UserRole.ADMIN && (
                    <div className="mb-6">
                        <p className="px-4 text-[10px] font-black text-sees-mint/30 uppercase tracking-[0.2em] mb-4">
                            Command Center
                        </p>
                        {adminItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3 rounded-lg transition-all group
                  ${
                      isActive
                          ? "bg-sees-mustard text-sees-void shadow-glow-mustard"
                          : "text-sees-mustard/60 hover:text-sees-mustard hover:bg-sees-mustard/5"
                  }
                `}
                            >
                                <item.icon size={20} />
                                <span className="font-bold text-sm">
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </div>
                )}
            </nav>

            <div className="p-6 border-t border-sees-mint/10 space-y-4">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-sees-mint/20 border-2 border-sees-mint/40 overflow-hidden">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                                user?.full_name || "Admin"
                            }`}
                            alt="Avatar"
                        />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black truncate">
                            {user?.full_name || "System Admin"}
                        </p>
                        <p className="text-[10px] text-sees-mint/40 uppercase font-black">
                            {role || "ADMIN"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/5 transition-all font-bold text-sm"
                >
                    <LogOut size={20} />
                    <span>Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};
