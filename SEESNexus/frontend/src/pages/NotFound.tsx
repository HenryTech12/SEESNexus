import React from "react";
import { Link } from "react-router-dom";
import { Home, Terminal } from "lucide-react";

const NotFound = () => (
    <div className="min-h-screen bg-sees-void flex items-center justify-center p-8 font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,_transparent,_transparent_2px,_rgba(167,255,235,0.02)_3px)] pointer-events-none" />

        <div className="text-center max-w-lg relative z-10">
            <div className="flex items-center justify-center gap-3 text-sees-mint/30 text-[10px] font-black tracking-[0.3em] mb-10 uppercase">
                <Terminal size={12} />
                NEXUS_SYSTEM / ERROR
            </div>

            <div className="text-[clamp(80px,20vw,140px)] font-black tracking-tighter text-white/5 leading-none select-none mb-[-1rem]">
                404
            </div>

            <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white mb-3">
                ROUTE_NOT_FOUND
            </h2>
            <p className="text-sees-mint/30 text-[10px] font-bold tracking-widest uppercase mb-10 max-w-xs mx-auto">
                The coordinate you're navigating to doesn't exist in this network.
            </p>

            <div className="h-px w-16 bg-sees-mint/20 mx-auto mb-10" />

            <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3 bg-sees-mint text-sees-void font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-sees-mint/90 transition-colors shadow-glow-mint"
            >
                <Home size={14} />
                RETURN_TO_BASE
            </Link>
        </div>
    </div>
);

export default NotFound;
