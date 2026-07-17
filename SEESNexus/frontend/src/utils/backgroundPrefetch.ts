import { shouldAvoidBackgroundPrefetch } from "./connectionAware";

type ModuleImporter = () => Promise<unknown>;

const scheduleIdle = (
    callback: () => void,
    timeout: number,
    fallbackDelay: number,
) => {
    if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(callback, { timeout });
    } else {
        window.setTimeout(callback, fallbackDelay);
    }
};

// Runs each importer in turn during idle time, one at a time — never all at
// once — so background prefetching never bursts and competes with whatever
// the user is actually doing. Waits for the page's own `load` event before
// starting anything: firing earlier lets prefetch compete with the current
// page's own critical resources (images, fonts) on a slow connection, which
// measurably made the page it was trying to help feel slower in testing.
// Skipped entirely on a constrained connection or with Data Saver on — see
// connectionAware.ts.
export const prefetchInBackground = (modules: ModuleImporter[]) => {
    // Vitest sets MODE to "test". Prefetching is a real-browser performance
    // concern — under test it would actually execute these dynamic imports
    // (compiling recharts/Quill/Three.js for real, since nothing mocks
    // import() itself), which is slow and has nothing to do with what any
    // given test is checking. Skip it outright rather than let it run.
    if (import.meta.env.MODE === "test") return;
    if (shouldAvoidBackgroundPrefetch()) return;

    const runNext = (index: number) => {
        if (index >= modules.length) return;
        scheduleIdle(
            () => {
                modules[index]().catch(() => {});
                runNext(index + 1);
            },
            3000,
            500,
        );
    };

    const start = () => runNext(0);
    if (document.readyState === "complete") {
        start();
    } else {
        window.addEventListener("load", start, { once: true });
    }
};
