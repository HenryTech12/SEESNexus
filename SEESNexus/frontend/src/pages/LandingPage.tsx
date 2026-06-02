import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import {
    OrbitControls,
    Stars,
    Float,
    Text,
    MeshDistortMaterial,
} from "@react-three/drei";
import { Link } from "react-router-dom";
import { ChevronRight, Zap, Globe, Shield } from "lucide-react";
import { Button } from "../components/ui/Button";

const Scene = () => {
    return (
        <>
            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh position={[0, 0, 0]}>
                    <icosahedronGeometry args={[2, 1]} />
                    <MeshDistortMaterial
                        color="#10b981"
                        speed={3}
                        distort={0.4}
                        wireframe
                        opacity={0.3}
                        transparent
                    />
                </mesh>
            </Float>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#059669" />
        </>
    );
};

const Landing = () => {
    return (
        <div className="relative min-h-screen bg-black text-white font-mono overflow-hidden">
            {/* 3D Canvas Background */}
            <div className="absolute inset-0 z-0">
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
                    <Suspense fallback={null}>
                        <Scene />
                    </Suspense>
                </Canvas>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Navbar */}
                <nav className="p-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:rotate-12 transition-transform">
                            <Zap className="w-6 h-6 text-black fill-current" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter italic">
                            NEXUS
                        </span>
                    </div>

                    <div className="hidden md:flex gap-10 text-[10px] font-black tracking-[0.2em] text-gray-400">
                        <Link
                            to="/projects"
                            className="hover:text-emerald-400 transition-colors uppercase"
                        >
                            Network
                        </Link>
                        <Link
                            to="/hardware"
                            className="hover:text-emerald-400 transition-colors uppercase"
                        >
                            Inventory
                        </Link>
                        <Link
                            to="/events"
                            className="hover:text-emerald-400 transition-colors uppercase"
                        >
                            Protocol
                        </Link>
                    </div>

                    <Link to="/login">
                        <Button className="px-6 py-2 text-[10px]">
                            AUTHENTICATE
                        </Button>
                    </Link>
                </nav>

                {/* Hero Section */}
                <main className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black tracking-widest mb-8 uppercase">
                            <Globe className="w-3 h-3" />
                            Global Hub for SEES Engineering
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6 leading-[0.9]">
                            INNOVATING <br />
                            <span className="text-emerald-500">
                                FROM AKOKA
                            </span>{" "}
                            <br />
                            TO THE WORLD
                        </h1>

                        <p className="text-gray-400 max-w-2xl mx-auto mb-12 text-sm md:text-base italic leading-relaxed font-sans font-medium">
                            "The SEES Nexus is the centralized intelligence
                            directive for the Society of Electrical and
                            Electronics Students, UNILAG. Build, collaborate,
                            and access high-performance hardware for the next
                            evolution."
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link to="/register">
                                <Button className="px-10 py-5 text-sm group">
                                    INITIATE PROFILE
                                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/projects">
                                <button className="px-10 py-5 text-sm font-black border border-white/10 hover:bg-white/5 transition-all rounded-lg italic tracking-widest uppercase">
                                    EXPLORE_ARCHIVE
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </main>

                {/* Footer Metrics */}
                <footer className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 bg-black/40 backdrop-blur-sm">
                    {[
                        { label: "Active Projects", value: "42" },
                        { label: "Network Nodes", value: "1.2k" },
                        { label: "Inventory Units", value: "500+" },
                        { label: "System Uptime", value: "99.9%" },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-1 border-l-2 border-emerald-500/20 pl-4"
                        >
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                {stat.label}
                            </span>
                            <span className="text-2xl font-black italic tracking-tighter">
                                {stat.value}
                            </span>
                        </div>
                    ))}
                </footer>
            </div>

            {/* Scanning Line Effect */}
            <div className="absolute inset-0 pointer-events-none z-50">
                <div className="w-full h-[2px] bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-scan" />
            </div>
        </div>
    );
};

export default Landing;
