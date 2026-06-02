import React from "react";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = "",
    hoverGlow = false,
}) => {
    return (
        <div
            className={`glass-card p-6 overflow-hidden relative group ${className} ${
                hoverGlow
                    ? "hover:shadow-glow-mint transition-shadow duration-300"
                    : ""
            }`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-sees-mint/5 to-transparent pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </div>
    );
};
