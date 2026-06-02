import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button";

interface AuthWrapperProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({
    children,
    allowedRoles,
}) => {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8 text-center font-mono relative overflow-hidden">
                {/* Red Alert Background */}
                <div className="absolute inset-0 bg-red-900/5 animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-red-500/20" />

                <div className="max-w-xl relative z-10 border border-red-500/20 bg-red-500/5 p-12 backdrop-blur-xl">
                    <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6 animate-bounce" />
                    <h1 className="text-5xl font-black text-red-500 mb-2 tracking-tighter italic">
                        ACCESS_DENIED
                    </h1>
                    <p className="text-red-400/60 mb-8 text-xs font-bold tracking-[0.2em]">
                        ERROR CODE: 403_INSUFFICIENT_CLEARANCE
                    </p>
                    <div className="h-[1px] w-12 bg-red-500/50 mx-auto mb-8" />
                    <p className="text-gray-300 mb-10 leading-relaxed italic">
                        "Authentication protocol failed to verify required
                        security clearance for current coordinate. This incident
                        has been logged in the Nexus Security Audit."
                    </p>
                    <Link to="/dashboard">
                        <Button className="bg-red-500 hover:bg-red-600 text-black font-black italic px-8">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            RETURN_TO_SAFE_ZONE
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
