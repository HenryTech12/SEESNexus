import React, { useEffect } from "react";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { Hero } from "../components/landing/Hero";
import { SponsorStrip } from "../components/landing/SponsorStrip";
import { InnovationCarousel } from "../components/landing/InnovationCarousel";
import { TeamGrid } from "../components/landing/TeamGrid";
import { StatsBar } from "../components/landing/StatsBar";
import { LandingFooter } from "../components/landing/LandingFooter";

const Landing = () => {
    // Login/Register are the most likely next click from here, and their
    // chunk drags in the whole Three.js stack (~940KB) — on a slow connection
    // that's an 11s+ wait on first click if we only start fetching it then.
    //
    // routePrefetch/backgroundPrefetch/connectionAware are imported
    // dynamically here rather than at the top of this file: routePrefetch.ts
    // now defines every page's import() target (needed for AppLayout's
    // sidebar-wide prefetch too), and a static import of it from Landing —
    // the app's single eager entry — risked Vite cross-linking Landing's own
    // chunk to unrelated heavy vendor chunks, exactly like it did for
    // AppLayout (see the comment there). A dynamic import keeps that link
    // purely runtime, confirmed safe by re-testing after this change.
    useEffect(() => {
        let isMounted = true;
        let removeListeners: (() => void) | undefined;

        (async () => {
            const [{ loginModule, registerModule }, { prefetchInBackground }, { shouldAvoidBackgroundPrefetch }] =
                await Promise.all([
                    import("../utils/routePrefetch"),
                    import("../utils/backgroundPrefetch"),
                    import("../utils/connectionAware"),
                ]);
            if (!isMounted) return;

            prefetchInBackground([loginModule, registerModule]);

            // Backstop: starts the fetch the instant someone shows clear
            // intent (covers a click landing before the background chain
            // fires). Delegated on `document` since the Login/Register links
            // live in several child components (navbar, hero CTA, footer,
            // team CTA), not one place.
            const onPointerNearAuthLink = (e: Event) => {
                if (shouldAvoidBackgroundPrefetch()) return;
                const target = e.target as HTMLElement | null;
                if (target?.closest('a[href="/login"], a[href="/register"]')) {
                    loginModule().catch(() => {});
                    registerModule().catch(() => {});
                }
            };
            document.addEventListener("mouseover", onPointerNearAuthLink);
            document.addEventListener("focusin", onPointerNearAuthLink);
            document.addEventListener("touchstart", onPointerNearAuthLink, {
                passive: true,
            });
            removeListeners = () => {
                document.removeEventListener("mouseover", onPointerNearAuthLink);
                document.removeEventListener("focusin", onPointerNearAuthLink);
                document.removeEventListener(
                    "touchstart",
                    onPointerNearAuthLink,
                );
            };
        })();

        return () => {
            isMounted = false;
            removeListeners?.();
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-sees-void text-white">
            <LandingNavbar />
            <Hero />
            <SponsorStrip />
            <InnovationCarousel />
            <TeamGrid />
            <StatsBar />
            <LandingFooter whatsappUrl="https://chat.whatsapp.com/FrQsm4atLtXEWbe43W6sqA" />
        </div>
    );
};

export default Landing;
