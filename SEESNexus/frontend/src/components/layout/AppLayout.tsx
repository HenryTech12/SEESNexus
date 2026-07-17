import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Module-level, not component state: AppLayout remounts on every navigation
// between authenticated pages, but this chain should only ever be kicked off
// once per full page load — not restarted from page 1 each time someone
// clicks a sidebar link.
let hasScheduledAppPrefetch = false;

const AppLayout = ({
  children,
  className = "bg-black text-white font-mono overflow-hidden",
}: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Warms the cache for every other authenticated page in the background
  // (see routePrefetch.ts / backgroundPrefetch.ts) so clicking around the
  // sidebar after the first page feels instant instead of paying each page's
  // chunk-fetch cost on first visit.
  //
  // Imported dynamically here rather than statically at the top of this
  // file: AppLayout is itself a shared chunk pulled in by 8 different lazy
  // pages, so a static import here gave Vite a static (not runtime-gated)
  // path from AppLayout's chunk to the Projects page's dynamic import — and
  // Vite auto-preloads whatever a chunk can statically reach, regardless of
  // any runtime guard. That made vendor-three (Three.js, ~940KB) load the
  // instant ANY authenticated page rendered, completely bypassing the
  // connection-aware guard below. A dynamic import here keeps that link
  // purely runtime, so nothing gets auto-preloaded just because AppLayout
  // loaded — confirmed by re-testing after this fix.
  useEffect(() => {
    if (hasScheduledAppPrefetch) return;
    hasScheduledAppPrefetch = true;
    import("../../utils/routePrefetch").then(({ authenticatedAppModules }) => {
      import("../../utils/backgroundPrefetch").then(
        ({ prefetchInBackground }) => {
          prefetchInBackground(authenticatedAppModules);
        },
      );
    });
  }, []);

  // Lock body scroll while the mobile drawer is open so the page behind it can't scroll.
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Auto-close the drawer if the viewport crosses into the desktop (lg) breakpoint,
  // where the sidebar is always visible and the drawer/backdrop/focus-trap no longer apply.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className={`flex min-h-screen ${className}`}>
      {/* Mobile topbar — hidden on lg+ where sidebar is always visible */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-sees-forest/90 backdrop-blur-xl border-b border-sees-mint/10 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="p-2 text-sees-mint/60 hover:text-sees-mint transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sees-mint rounded-lg flex items-center justify-center font-black text-sees-void text-xs shadow-glow-mint">
            SN
          </div>
          <span className="font-black text-white text-sm">SEES</span>
          <span className="text-[9px] text-sees-mint/40 uppercase tracking-widest">
            Nexus
          </span>
        </div>
        {/* Spacer to balance hamburger and keep logo centered */}
        <div className="w-10" />
      </div>

      {/* Backdrop overlay — tapping it closes the sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <motion.main
        className="flex-1 min-w-0 overflow-x-hidden lg:ml-72 p-4 md:p-8 pt-20 md:pt-20 lg:pt-8 relative"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default AppLayout;
