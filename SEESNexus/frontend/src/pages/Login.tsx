import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
    OrbitControls,
    Float,
    Sphere,
    MeshDistortMaterial,
} from "@react-three/drei";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { formatError } from "../utils/errorHelper";
import toast from "react-hot-toast";

const LoginScene = () => {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            dpr={[1, 1.5]}
            onCreated={({ gl }) => {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                gl.setPixelRatio(dpr);
                const canvas = gl.domElement;
                const onLost = (e: Event) => e.preventDefault();
                const onRestore = () => window.location.reload();
                canvas.addEventListener('webglcontextlost', onLost, false);
                canvas.addEventListener('webglcontextrestored', onRestore, false);
            }}
        >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#A7FFEB" />
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <Sphere args={[1, 64, 64]}>
                    <MeshDistortMaterial
                        color="#004D40"
                        speed={3}
                        distort={0.4}
                        metalness={0.8}
                        roughness={0.2}
                    />
                </Sphere>
            </Float>
            <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
    );
};

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password) {
            toast.error("Email and password are required");
            return;
        }
        setIsLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const response = await api.post("/auth/login", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const { access_token, refresh_token, user } = response.data.data;
            setAuth(user);
            localStorage.setItem("sees_access_token", access_token);
            // Stored so the axios refresh interceptor can silently renew
            // the access token once it expires.
            localStorage.setItem("sees_refresh_token", refresh_token);
            toast.success("Login successful!");
            navigate("/dashboard");
        } catch (error) {
            toast.error(formatError(error, "Login failed"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-sees-void overflow-hidden">
            {/* Left side - 3D Scene */}
            <div className="md:w-1/2 h-[40vh] md:h-screen relative bg-gradient-to-b from-sees-forest/20 to-sees-void">
                <Suspense fallback={null}>
                    <LoginScene />
                </Suspense>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-glow-mint tracking-tighter">
                            SEES NEXUS
                        </h2>
                        <p className="text-sees-mint/40 uppercase tracking-[0.2em] text-xs">
                            Innovation Hub
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="md:w-1/2 flex items-center justify-center p-8 bg-sees-forest/10">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-md w-full"
                >
                    <div className="mb-8">
                        <h1 className="text-4xl font-black mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-sees-mint/60">
                            Access the engineering command center.
                        </p>
                    </div>

                    <GlassCard className="border-sees-mint/20">
                        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                            <div>
                                <label className="block text-xs font-bold text-sees-mint uppercase tracking-widest mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@students.unilag.edu.ng"
                                    className="w-full bg-sees-void/50 border border-sees-mint/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-sees-mint outline-none transition-all"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-sees-mint uppercase tracking-widest">
                                        Password
                                    </label>
                                    {/* No password-reset endpoint exists yet — disabled rather than
                                        linking to a dead "#" or a flow that isn't built. */}
                                    <span
                                        aria-disabled="true"
                                        title="Password reset isn't available yet"
                                        className="text-xs text-sees-mustard/40 cursor-not-allowed select-none"
                                    >
                                        Forgot password?
                                    </span>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-sees-void/50 border border-sees-mint/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-sees-mint outline-none transition-all"
                                />
                            </div>

                            <Button 
                                className="w-full" 
                                type="submit"
                                isLoading={isLoading}
                            >
                                Initialize Login
                            </Button>

                            <div className="text-center pt-4 border-t border-sees-mint/10">
                                <p className="text-sm text-sees-mint/50">
                                    New to the hub?{" "}
                                    <Link
                                        to="/register"
                                        className="text-sees-mustard font-bold hover:underline"
                                    >
                                        Create an account
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
