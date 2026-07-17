import { useEffect, lazy, Suspense } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import authService from "./services/authService";
import { useAuthStore } from "./store/authStore";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { AuthWrapper } from "./components/layout/AuthWrapper";
import { UserRole } from "./types";

// Landing is the only route loaded eagerly — it's the first thing a new
// visitor sees and doesn't pull in any heavy dependencies (no Three.js, no
// Quill, no recharts), so there's nothing to gain by lazy-loading it and it
// would only add a Suspense flash on first paint. Everything else is
// route-split so its dependencies (Three.js on Login/Projects, Quill on
// ArticleComposer, recharts on Dashboard) only download when that route is
// actually visited.
//
// Each import() target lives in its own file under src/lazyRoutes/ rather
// than inline here: co-locating multiple import() expressions in one file
// (this file, or the old shared routePrefetch.ts) made Vite cross-link their
// preload-dependency lists — Dashboard's chunk ended up with a hard,
// eager import of vendor-three (Three.js, ~940KB) purely because Projects'
// import() lived in the same file, with the same happening to two other
// pages. Confirmed via inspecting the compiled chunk output, and confirmed
// fixed by this one-file-per-page split. routePrefetch.ts re-exports these
// same functions (not duplicates) for LandingPage's and AppLayout's
// background-prefetch effects, so both usages resolve to the exact same chunk.
import Landing from "./pages/LandingPage";
import loginModule from "./lazyRoutes/login";
import registerModule from "./lazyRoutes/register";
import dashboardModule from "./lazyRoutes/dashboard";
import projectsModule from "./lazyRoutes/projects";
import hardwareModule from "./lazyRoutes/hardware";
import eventsModule from "./lazyRoutes/events";
import articlesModule from "./lazyRoutes/articles";
import articleComposerModule from "./lazyRoutes/articleComposer";
import adminPanelModule from "./lazyRoutes/adminPanel";
import profileModule from "./lazyRoutes/profile";
import qrScannerModule from "./lazyRoutes/qrScanner";
import notFoundModule from "./lazyRoutes/notFound";
const Login = lazy(loginModule);
const Register = lazy(registerModule);
const Dashboard = lazy(dashboardModule);
const Projects = lazy(projectsModule);
const Hardware = lazy(hardwareModule);
const Events = lazy(eventsModule);
const Articles = lazy(articlesModule);
const ArticleComposer = lazy(articleComposerModule);
const AdminPanel = lazy(adminPanelModule);
const Profile = lazy(profileModule);
const QRScanner = lazy(qrScannerModule);
const NotFound = lazy(notFoundModule);

const RouteFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-sees-void">
        <Loader2 className="w-8 h-8 animate-spin text-sees-mint" />
    </div>
);

function App() {
    const { isAuthenticated, logout } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) return;
        // Validate the persisted session once on mount. If both access and
        // refresh tokens are expired the axios interceptor can't recover and
        // will throw a 401 — clear state so the user hits the login page
        // instead of seeing a broken protected view. Network failures are
        // ignored so a flaky connection doesn't log someone out by accident.
        authService.validateToken().catch((err) => {
            if (err?.response?.status === 401) logout();
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <ErrorBoundary>
            <Router>
                <Toaster position="bottom-right" reverseOrder={false} />
                <Suspense fallback={<RouteFallback />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <AuthWrapper>
                                    <Dashboard />
                                </AuthWrapper>
                            }
                        />
                        <Route
                            path="/projects"
                            element={
                                <AuthWrapper>
                                    <Projects />
                                </AuthWrapper>
                            }
                        />
                        <Route
                            path="/hardware"
                            element={
                                <AuthWrapper>
                                    <Hardware />
                                </AuthWrapper>
                            }
                        />
                        <Route
                            path="/events"
                            element={
                                <AuthWrapper>
                                    <Events />
                                </AuthWrapper>
                            }
                        />
                        <Route
                            path="/articles"
                            element={
                                <AuthWrapper>
                                    <Articles />
                                </AuthWrapper>
                            }
                        />
                        <Route
                            path="/articles/new"
                            element={
                                <AuthWrapper
                                    allowedRoles={[
                                        UserRole.CONTRIBUTOR,
                                        UserRole.ADMIN,
                                    ]}
                                >
                                    <ArticleComposer />
                                </AuthWrapper>
                            }
                        />
                        <Route
                            path="/articles/:slug/edit"
                            element={
                                <AuthWrapper
                                    allowedRoles={[
                                        UserRole.CONTRIBUTOR,
                                        UserRole.ADMIN,
                                    ]}
                                >
                                    <ArticleComposer />
                                </AuthWrapper>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <AuthWrapper>
                                    <Profile />
                                </AuthWrapper>
                            }
                        />
                        <Route
                            path="/hardware/scan"
                            element={
                                <AuthWrapper>
                                    <QRScanner />
                                </AuthWrapper>
                            }
                        />

                        {/* Admin Only Routes */}
                        <Route
                            path="/admin"
                            element={
                                <AuthWrapper allowedRoles={[UserRole.ADMIN]}>
                                    <AdminPanel />
                                </AuthWrapper>
                            }
                        />

                        {/* 404 — shown for any unmatched path */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
