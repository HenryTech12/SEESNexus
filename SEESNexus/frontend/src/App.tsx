import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import Landing from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Hardware from "./pages/Hardware";
import Events from "./pages/Events";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import QRScanner from "./pages/QRScanner";
import { AuthWrapper } from "./components/layout/AuthWrapper";
import { UserRole } from "./types";

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Toaster position="bottom-right" reverseOrder={false} />
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

                    {/* Catch-all Redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
