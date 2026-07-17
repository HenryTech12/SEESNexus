import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            "/api/v1": {
                target: "http://localhost:8000",
                changeOrigin: true,
            },
        },
    },
    build: {
        modulePreload: {
            // Belt-and-suspenders alongside output.hoistTransitiveImports
            // below (the real fix for pages ending up with an eager import
            // of an unrelated heavy vendor chunk): still strip any heavy
            // vendor chunk out of the HTML-level preload links specifically,
            // so Landing's index.html never hints at preloading Three.js/
            // Quill/recharts it doesn't use, while a page that genuinely
            // needs one still gets it preloaded in its own JS-level list.
            resolveDependencies: (_filename, deps, { hostType }) =>
                hostType === "html"
                    ? deps.filter((dep) => !dep.includes("vendor-three") && !dep.includes("vendor-quill") && !dep.includes("vendor-charts"))
                    : deps,
        },
        rollupOptions: {
            output: {
                // Rollup's default (true) hoists a dynamically-imported
                // chunk's OWN transitive static imports up into whichever
                // chunk imports it, to cut down the total number of import
                // statements. That's the actual mechanism behind Dashboard/
                // ArticleComposer ending up with a hard import of
                // vendor-three: confirmed by testing — disabling Vite's
                // entire modulePreload layer (a higher-level concern) had
                // zero effect on this, so it has to be happening in Rollup's
                // own chunk graph, below that layer. Turning this off stops
                // Rollup from flattening those transitive imports forward.
                hoistTransitiveImports: false,
                // Heavy libraries used by only a few routes get their own
                // chunk instead of being duplicated into every page chunk
                // that imports them (or bloating the main bundle).
                //
                // react/react-dom/scheduler are carved out FIRST and pinned to
                // their own chunk deliberately: without this, Rollup sees that
                // @react-three/fiber depends on react, notices react is shared
                // between the "vendor-three" module subgraph and the main
                // entry, and physically homes the shared copy of react inside
                // vendor-three.js — which then forces every single page
                // (including ones with no 3D content at all) to statically
                // import react from vendor-three.js and download the whole
                // Three.js stack just to boot. Giving react its own stable,
                // always-needed chunk up front stops Rollup from picking a
                // heavy chunk as react's home.
                manualChunks: (id) => {
                    // Vite/Rollup's own shared synthetic runtime helpers (the
                    // dynamic-import preload helper, the modulepreload
                    // polyfill, the CJS-interop helper) are each used by
                    // *every* chunk that needs them — including both the main
                    // entry and every lazy route. Left unpinned, Rollup's
                    // default heuristic can physically co-locate them inside
                    // whichever heavy vendor chunk it happens to process
                    // first. Pin them to the always-loaded react chunk so
                    // none of the heavy, route-specific vendor chunks can end
                    // up "owning" one.
                    if (
                        id.includes("vite/preload-helper") ||
                        id.includes("vite/modulepreload-polyfill") ||
                        id.includes("commonjsHelpers")
                    ) {
                        return "vendor-react";
                    }
                    if (!id.includes("node_modules")) return undefined;
                    if (
                        id.includes("/react/") ||
                        id.includes("/react-dom/") ||
                        id.includes("/scheduler/")
                    ) {
                        return "vendor-react";
                    }
                    // Our own authStore.ts uses the top-level zustand package
                    // eagerly (App.tsx -> useAuthStore). @react-three/fiber and
                    // drei also depend on zustand, but via their OWN nested
                    // node_modules copies — except when npm hoists a compatible
                    // version and they end up resolving to this SAME top-level
                    // copy, which is what happened here: with no explicit home,
                    // Rollup entangled the shared top-level zustand inside
                    // vendor-three, forcing every page to load the entire
                    // Three.js stack just to read the auth store. Their nested
                    // copies (path contains "@react-three"/"@react-spring")
                    // are unaffected and stay bundled with vendor-three.
                    if (
                        id.includes("/zustand/") &&
                        !id.includes("@react-three") &&
                        !id.includes("@react-spring")
                    ) {
                        return "vendor-react";
                    }
                    if (id.includes("three") || id.includes("@react-three")) {
                        return "vendor-three";
                    }
                    if (id.includes("quill")) return "vendor-quill";
                    if (id.includes("recharts") || id.includes("d3-")) {
                        return "vendor-charts";
                    }
                    return undefined;
                },
            },
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        css: false,
    },
});
