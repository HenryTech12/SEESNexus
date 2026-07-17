import React from "react";

const ROWS: { words: string; direction: "left" | "right" }[] = [
  { words: "EMBEDDED SYSTEMS • VLSI DESIGN", direction: "left" },
  { words: "POWER GRIDS • AUTOMATION", direction: "right" },
  { words: "SIGNAL PROCESSING • TELECOMMUNICATIONS", direction: "left" },
  { words: "IOT • ROBOTICS", direction: "right" },
  { words: "RENEWABLE ENERGY • CIRCUIT DESIGN", direction: "left" },
];

// Reveal is handled by the parent's clip-path mask now, so this just renders the rows.
export const MarqueeRows: React.FC = () => {
  return (
    <div className="absolute inset-0 z-[5] flex flex-col items-center justify-evenly xl:justify-center py-14 sm:py-16 xl:py-0 gap-1 sm:gap-2 pointer-events-none overflow-hidden">
      {ROWS.map((row, i) => (
        <div key={i} className="w-full overflow-hidden whitespace-nowrap">
          <div
            className={`inline-flex ${
              row.direction === "left"
                ? "animate-marquee-left"
                : "animate-marquee-right"
            }`}
          >
            {[0, 1].map((dup) => (
              <span
                key={dup}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tight text-white/15 px-6 shrink-0"
              >
                {row.words}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
