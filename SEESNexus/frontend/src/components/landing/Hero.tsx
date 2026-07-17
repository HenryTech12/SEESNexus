import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronRight, Globe } from "lucide-react";
import { Button } from "../ui/Button";
import { CircuitViaReveal } from "./CircuitViaReveal";
import { MarqueeRows } from "./MarqueeRows";

export const Hero: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Outer section is 200vh tall so scrolling through it drives progress
    // while the inner content stays visually pinned via `sticky`.
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Raw scrollYProgress jumps in chunky steps on wheel/trackpad input (each tick
    // is a fixed pixel delta), which reads as "hard"/jerky since the mask and
    // headline transforms below redraw in matching jumps. Springing it smooths
    // those steps into continuous motion without changing how far the user has to scroll.
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.5 });

    const headlineOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0]);
    const headlineScale = useTransform(smoothProgress, [0, 0.4], [1, 1.06]);
    // Once the headline has faded out, stop it from intercepting clicks meant for the CTAs/content behind it
    const headlinePointerEvents = useTransform(headlineOpacity, (o) => (o < 0.05 ? "none" : "auto"));

    return (
        <section ref={containerRef} className="relative h-[200vh]">
            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-gradient-sees font-sans">
                <CircuitViaReveal progress={smoothProgress}>
                    <MarqueeRows />
                </CircuitViaReveal>

                <motion.div
                    style={{ opacity: headlineOpacity, scale: headlineScale, pointerEvents: headlinePointerEvents }}
                    className="relative z-10 px-4 text-center max-w-5xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sees-mint/10 border border-sees-mint/20 text-sees-mint text-[10px] font-black tracking-widest mb-8 uppercase">
                        <Globe className="w-3 h-3" />
                        Global Hub for SEES Engineering
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[0.95] text-white">
                        INNOVATING <br />
                        <span className="text-sees-mint">FROM AKOKA</span> <br />
                        TO THE WORLD
                    </h1>

                    <p className="text-white/60 max-w-2xl mx-auto mb-12 text-sm md:text-base leading-relaxed">
                        The SEES Nexus is the centralized hub for the Society of Electrical
                        and Electronics Students, UNILAG — build, collaborate, and access
                        high-performance hardware for the next evolution.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/register">
                            <Button variant="primary" size="lg" className="group">
                                Initiate Profile
                                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link to="/projects">
                            <Button variant="secondary" size="lg">
                                Explore Projects
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
