import React from "react";
import {
    Building2,
    Landmark,
    Cpu,
    ShieldCheck,
    Network,
    LucideIcon,
} from "lucide-react";

interface Sponsor {
    name: string;
    logoUrl?: string;
}

// No real partner logos confirmed yet — each entry renders a generic icon mark
// instead of a fabricated brand name. Add a logoUrl once a real asset exists
// and it renders in place of the icon automatically.
const PLACEHOLDER_SPONSORS: Sponsor[] = [
    { name: "Partner" },
    { name: "Partner" },
    { name: "Partner" },
    { name: "Partner" },
    { name: "Partner" },
];

const PLACEHOLDER_ICONS: LucideIcon[] = [
    Building2,
    Landmark,
    Cpu,
    Network,
    ShieldCheck,
];

interface SponsorStripProps {
    sponsors?: Sponsor[];
}

export const SponsorStrip: React.FC<SponsorStripProps> = ({
    sponsors = PLACEHOLDER_SPONSORS,
}) => {
    return (
        <section className="py-10 border-y border-sees-teal/10 bg-sees-void">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-white/30 mb-6">
                    Backed by
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6">
                    {sponsors.map((sponsor, i) =>
                        sponsor.logoUrl ? (
                            <img
                                key={i}
                                src={sponsor.logoUrl}
                                alt={sponsor.name}
                                className="h-8 opacity-40 grayscale hover:opacity-80 hover:grayscale-0 transition-all"
                            />
                        ) : (
                            (() => {
                                const Icon = PLACEHOLDER_ICONS[i % PLACEHOLDER_ICONS.length];
                                return (
                                    <Icon
                                        key={i}
                                        aria-label={sponsor.name}
                                        className="w-8 h-8 text-white/25 hover:text-sees-mint/60 transition-colors"
                                    />
                                );
                            })()
                        ),
                    )}
                </div>
            </div>
        </section>
    );
};
