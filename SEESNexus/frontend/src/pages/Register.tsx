import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { formatError } from "../utils/errorHelper";
import {
    User,
    Shield,
    GraduationCap,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";

const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Academic Info", icon: GraduationCap },
    { id: 3, title: "Role Selection", icon: Shield },
];

export const Register = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmCode, setConfirmCode] = useState("");
    const [department, setDepartment] = useState(
        "Electrical/Electronics Engineering"
    );
    const [level, setLevel] = useState("100L");
    const [studentId, setStudentId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = async () => {
        if (!email) {
            toast.error("Please enter an email address");
            return;
        }
        setIsLoading(true);
        try {
            await api.post("/notify/send-code", { email });
            toast.success("Verification code sent to your email!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalize = async () => {
        if (!selectedRole) {
            toast.error("Please select a role");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Verify code
            await api.post(
                `/notify/verify-code?email=${email}&code=${confirmCode}`
            );

            // 2. Register user
            const response = await api.post("/auth/register", {
                full_name: fullName,
                email,
                password,
                department,
                level,
                role: selectedRole,
            });

            const data = response.data.data;
            toast.success("Registration complete!");

            // Auto login after registration
            const loginRes = await api.post(
                "/auth/login",
                new URLSearchParams({
                    username: email,
                    password: password,
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            setAuth(loginRes.data.data.user, loginRes.data.data.access_token);
            localStorage.setItem("sees_access_token", loginRes.data.data.access_token);
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(formatError(error, "Registration failed"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sees-void flex items-center justify-center p-4 py-12 relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute top-0 left-0 w-full h-full bg-circuit-pattern opacity-5 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-sees-mint/10 filter blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sees-mustard/5 filter blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-2xl w-full relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black mb-2 text-glow-mint">
                        Join SEES Nexus
                    </h1>
                    <p className="text-sees-mint/60">
                        The digital ecosystem of SEES UNILAG.
                    </p>
                </div>

                {/* Progress bar */}
                <div className="flex justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-sees-mint/10 -translate-y-1/2 z-0" />
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const active = currentStep >= step.id;
                        return (
                            <div
                                key={step.id}
                                className="relative z-10 flex flex-col items-center"
                            >
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                                        active
                                            ? "bg-sees-mint text-sees-void shadow-glow-mint scale-110"
                                            : "bg-sees-void border-2 border-sees-mint/20 text-sees-mint/40"
                                    }`}
                                >
                                    <Icon size={20} />
                                </div>
                                <span
                                    className={`text-[10px] font-bold uppercase tracking-widest mt-3 ${
                                        active
                                            ? "text-sees-mint"
                                            : "text-sees-mint/30"
                                    }`}
                                >
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <GlassCard className="border-sees-mint/20">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-sees-mint uppercase tracking-widest mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) =>
                                                setFullName(e.target.value)
                                            }
                                            placeholder="Fakorode Henry"
                                            className="w-full bg-sees-void/50 border border-sees-mint/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-sees-mint outline-none transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-sees-mint uppercase tracking-widest mb-2">
                                            Email Address
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                placeholder="name@students.unilag.edu.ng"
                                                className="flex-1 bg-sees-void/50 border border-sees-mint/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-sees-mint outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSendCode}
                                                disabled={isLoading}
                                                className="px-4 py-2 bg-sees-mint/10 border border-sees-mint/30 rounded-lg text-sees-mint text-[10px] font-bold uppercase tracking-widest hover:bg-sees-mint hover:text-sees-void transition-all whitespace-nowrap disabled:opacity-50"
                                            >
                                                {isLoading
                                                    ? "Sending..."
                                                    : "Send Code"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-sees-mint uppercase tracking-widest mb-2">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder="••••••••"
                                            className="w-full bg-sees-void/50 border border-sees-mint/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-sees-mint outline-none transition-all"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-sees-mint uppercase tracking-widest mb-2">
                                            Confirm Code
                                        </label>
                                        <input
                                            type="text"
                                            value={confirmCode}
                                            onChange={(e) =>
                                                setConfirmCode(e.target.value)
                                            }
                                            placeholder="••••••••"
                                            className="w-full bg-sees-void/50 border border-sees-mint/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-sees-mint outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-sees-mint uppercase tracking-widest mb-2">
                                            Department
                                        </label>
                                        <select
                                            value={department}
                                            onChange={(e) =>
                                                setDepartment(e.target.value)
                                            }
                                            className="w-full bg-sees-void/50 border border-sees-mint/20 rounded-lg px-4 py-3 text-white focus:border-sees-mint outline-none transition-all appearance-none"
                                        >
                                            <option>
                                                Electrical/Electronics
                                                Engineering
                                            </option>
                                            <option>
                                                Computer Engineering
                                            </option>
                                            <option>Systems Engineering</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-sees-mint uppercase tracking-widest mb-2">
                                            Level
                                        </label>
                                        <select
                                            value={level}
                                            onChange={(e) =>
                                                setLevel(e.target.value)
                                            }
                                            className="w-full bg-sees-void/50 border border-sees-mint/20 rounded-lg px-4 py-3 text-white focus:border-sees-mint outline-none transition-all appearance-none"
                                        >
                                            <option>100L</option>
                                            <option>200L</option>
                                            <option>300L</option>
                                            <option>400L</option>
                                            <option>500L</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-sees-mint uppercase tracking-widest mb-2">
                                            Student ID
                                        </label>
                                        <input
                                            type="text"
                                            value={studentId}
                                            onChange={(e) =>
                                                setStudentId(e.target.value)
                                            }
                                            placeholder="200XXX"
                                            className="w-full bg-sees-void/50 border border-sees-mint/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-sees-mint outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-3 gap-4">
                                    {["STUDENT", "CONTRIBUTOR", "ADMIN"].map(
                                        (role) => (
                                            <button
                                                key={role}
                                                onClick={() =>
                                                    setSelectedRole(role)
                                                }
                                                className={`p-4 border-2 rounded-xl transition-all group flex flex-col items-center gap-4 ${
                                                    selectedRole === role
                                                        ? "border-sees-mint bg-sees-mint/10 shadow-glow-mint"
                                                        : "border-sees-mint/20 hover:border-sees-mint hover:bg-sees-mint/5"
                                                }`}
                                            >
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                                        selectedRole === role
                                                            ? "bg-sees-mint text-sees-void"
                                                            : "bg-sees-mint/10 text-sees-mint group-hover:bg-sees-mint group-hover:text-sees-void"
                                                    }`}
                                                >
                                                    <Shield size={20} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                                    {role}
                                                </span>
                                            </button>
                                        )
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-between mt-10">
                        <Button
                            variant="ghost"
                            onClick={() =>
                                setCurrentStep((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentStep === 1}
                            className={currentStep === 1 ? "invisible" : ""}
                        >
                            <ChevronLeft size={20} className="mr-2" /> Previous
                        </Button>

                        {currentStep < 3 ? (
                            <Button
                                onClick={() =>
                                    setCurrentStep((prev) => prev + 1)
                                }
                            >
                                Next Protocol{" "}
                                <ChevronRight size={20} className="ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFinalize}
                                disabled={!selectedRole || isLoading}
                            >
                                {isLoading
                                    ? "Transmitting..."
                                    : "Finalize Transmission"}
                            </Button>
                        )}
                    </div>
                </GlassCard>

                <div className="text-center mt-8">
                    <p className="text-sm text-sees-mint/50">
                        Already registered?{" "}
                        <Link
                            to="/login"
                            className="text-sees-mustard font-bold hover:underline"
                        >
                            Login to Hub
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
