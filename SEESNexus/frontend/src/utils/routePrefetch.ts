// Re-exports the same functions App.tsx uses for its lazy() route
// definitions (each defined in its own file under src/lazyRoutes/, not
// duplicated here) so LandingPage's and AppLayout's background-prefetch
// effects resolve to the exact same chunk rather than triggering a second,
// separate fetch for the same page.
//
// Deliberately just re-exports with no import() expressions of its own:
// co-locating multiple import() calls in one file (this file used to define
// them directly) made Vite cross-link their preload-dependency lists, so
// pages ended up with hard, eager imports of unrelated heavy vendor chunks —
// see the comment in App.tsx for the full story.
import loginFn from "../lazyRoutes/login";
import registerFn from "../lazyRoutes/register";
import dashboardFn from "../lazyRoutes/dashboard";
import projectsFn from "../lazyRoutes/projects";
import hardwareFn from "../lazyRoutes/hardware";
import eventsFn from "../lazyRoutes/events";
import articlesFn from "../lazyRoutes/articles";
import articleComposerFn from "../lazyRoutes/articleComposer";
import adminPanelFn from "../lazyRoutes/adminPanel";
import profileFn from "../lazyRoutes/profile";
import qrScannerFn from "../lazyRoutes/qrScanner";

export const loginModule = loginFn;
export const registerModule = registerFn;
export const dashboardModule = dashboardFn;
export const projectsModule = projectsFn;
export const hardwareModule = hardwareFn;
export const eventsModule = eventsFn;
export const articlesModule = articlesFn;
export const articleComposerModule = articleComposerFn;
export const adminPanelModule = adminPanelFn;
export const profileModule = profileFn;
export const qrScannerModule = qrScannerFn;

// Every lazy page reachable from inside the authenticated app shell, in
// rough usage-priority order. Warmed up in the background (staggered, one
// at a time) once someone lands on any authenticated page, so clicking
// around the sidebar afterward feels instant instead of paying each page's
// chunk-fetch cost on first visit.
export const authenticatedAppModules = [
    dashboardModule,
    hardwareModule,
    eventsModule,
    articlesModule,
    profileModule,
    projectsModule,
    adminPanelModule,
    articleComposerModule,
    qrScannerModule,
];
