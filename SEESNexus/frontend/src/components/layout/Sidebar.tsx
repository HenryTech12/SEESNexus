import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  Rocket,
  Cpu,
  Calendar,
  User,
  Settings,
  LogOut,
  QrCode,
  LayoutDashboard,
  Newspaper,
  X,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", end: true },
  { icon: Rocket, label: "Innovation Gallery", path: "/projects", end: false },
  { icon: Cpu, label: "Hardware Lab", path: "/hardware", end: true },
  { icon: Calendar, label: "Events Hub", path: "/events", end: false },
  { icon: QrCode, label: "QR Scanner", path: "/hardware/scan", end: true },
  { icon: Newspaper, label: "Articles", path: "/articles", end: false },
  { icon: User, label: "My Profile", path: "/profile", end: false },
];

const adminItems = [{ icon: Settings, label: "Admin Panel", path: "/admin" }];

// Every page wraps itself in its own <AppLayout>, so Sidebar fully unmounts
// and remounts on each navigation — a plain DOM scrollTop would reset to 0
// each time. Module-level state survives the remount; component state wouldn't.
let savedNavScrollTop = 0;

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const { user, logout } = useAuthStore();
  const role = user?.role;
  const asideRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) navRef.current.scrollTop = savedNavScrollTop;
  }, []);

  // Escape-to-close + a basic focus trap while the drawer is open on mobile.
  // Guarded by `isOpen` so it never interferes with the always-visible lg+ sidebar.
  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key !== "Tab" || !asideRef.current) return;

      const focusable = asideRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <aside
      ref={asideRef}
      className={`w-72 bg-sees-forest/40 border-r border-sees-mint/10 flex flex-col fixed left-0 z-40 backdrop-blur-xl transition-transform duration-300 ease-in-out
        top-16 lg:top-0
        h-[calc(100vh-4rem)] lg:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="p-8 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sees-mint rounded-lg flex items-center justify-center font-black text-sees-void shadow-glow-mint">
            SN
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-none">SEES</h1>
            <p className="text-[10px] text-sees-mint/60 uppercase tracking-[0.2em]">
              Nexus Hub
            </p>
          </div>
        </div>
        {/* Close button — visible only on mobile */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="lg:hidden absolute top-5 right-5 p-1.5 text-sees-mint/40 hover:text-sees-mint transition-colors rounded"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <nav
        ref={navRef}
        onScroll={(e) => {
          savedNavScrollTop = e.currentTarget.scrollTop;
        }}
        className="flex-1 px-4 space-y-1 overflow-y-auto"
      >
        <div className="mb-6">
          <p className="px-4 text-[10px] font-black text-sees-mint/30 uppercase tracking-[0.2em] mb-4">
            Navigations
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
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
              <span className="font-bold text-sm">{item.label}</span>
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
                onClick={onClose}
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
                <span className="font-bold text-sm">{item.label}</span>
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
          onClick={() => { logout(); onClose?.(); }}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/5 transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};
