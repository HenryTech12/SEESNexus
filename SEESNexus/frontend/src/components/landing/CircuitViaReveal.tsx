import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

const TRACE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const RING_RADIUS = 48; // px — also the mask's starting radius, so the handoff is seamless

interface CircuitViaRevealProps {
  // 0 at rest (small via + framing traces) — 1 fully expanded, mask fills the viewport
  progress: MotionValue<number>;
  children: React.ReactNode;
}

export const CircuitViaReveal: React.FC<CircuitViaRevealProps> = ({
  progress,
  children,
}) => {
  // Spread across nearly the whole scroll (and a smaller ceiling than before)
  // so the mask reaches full-screen coverage much later — it was hitting most
  // screens' corner distance by ~30% scrolled, which read as "already open".
  // 3400px still comfortably exceeds the diagonal of any real display.
  const radiusPx = useTransform(progress, [0.1, 1], [RING_RADIUS, 3400], {
    clamp: true,
  });
  const clipPath = useTransform(radiusPx, (r) => `circle(${r}px at 50% 50%)`);

  // Ring/traces fade out right as the mask grows past them — reads as the
  // small via "becoming" the expanding circle rather than two separate shapes.
  const ringOpacity = useTransform(progress, [0.1, 0.35], [1, 0]);
  const traceOpacity = useTransform(progress, [0.1, 0.3], [0.7, 0]);
  const traceDistance = useTransform(progress, [0.1, 0.3], [0, 1], {
    clamp: true,
  });

  return (
    <>
      {/* Revealed layer: tech-grid background + content, clipped by the growing via */}
      <motion.div
        style={{ clipPath }}
        className="absolute inset-0 z-[4] bg-sees-void overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(167,255,235,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(167,255,235,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {children}
      </motion.div>

      {/* Resting via: thin ring + radiating circuit traces, framing the hero text */}
      <motion.div
        style={{ opacity: ringOpacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] pointer-events-none"
      >
        <div
          style={{ width: RING_RADIUS * 2, height: RING_RADIUS * 2 }}
          className="rounded-full border-2 border-sees-mint/70 shadow-[0_0_30px_rgba(167,255,235,0.35)]"
        />
        <div className="absolute inset-0 w-3 h-3 m-auto rounded-full bg-sees-mint" />

        {TRACE_ANGLES.map((angle) => (
          <Trace
            key={angle}
            angle={angle}
            opacity={traceOpacity}
            distance={traceDistance}
          />
        ))}
      </motion.div>
    </>
  );
};

interface TraceProps {
  angle: number;
  opacity: MotionValue<number>;
  distance: MotionValue<number>;
}

const Trace: React.FC<TraceProps> = ({ angle, opacity, distance }) => {
  const translate = useTransform(distance, (d) => `${RING_RADIUS + d * 90}px`);

  return (
    <motion.div
      style={{ opacity, transform: `rotate(${angle}deg)` }}
      className="absolute top-1/2 left-1/2 origin-left"
    >
      <motion.div
        style={{ x: translate }}
        className="h-px w-14 bg-sees-mint/60"
      />
    </motion.div>
  );
};
