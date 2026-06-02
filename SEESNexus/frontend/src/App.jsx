import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';

// Protected Pages
import Dashboard from './pages/student/Dashboard';
import Projects from './pages/student/Projects';
import HardwareLab from './pages/student/HardwareLab';
import Events from './pages/student/Events';
import Articles from './pages/student/Articles';
// import ArticleDetail from './pages/student/ArticleDetail';

// Contributor Pages
import ArticleComposer from './pages/contributor/ArticleComposer';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import LoanManagement from './pages/admin/LoanManagement';
import HardwareManagement from './pages/admin/HardwareManagement';

import ProtectedRoute from './components/auth/ProtectedRoute';

const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  // if (user?.role === 'CONTRIBUTOR') return <ContributorDashboard />; // Handled in specs
  return <Dashboard />;
};

const AppLayout = ({ children }) => (
  <div className="flex min-h-screen bg-sees-void">
    <Sidebar />
    <div className="flex-1 lg:ml-64 flex flex-col">
      <Topbar />
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout><DashboardRouter /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <AppLayout><Projects /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hardware"
        element={
          <ProtectedRoute>
            <AppLayout><HardwareLab /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <AppLayout><Events /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/articles"
        element={
          <ProtectedRoute>
            <AppLayout><Articles /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/articles/compose"
        element={
          <ProtectedRoute role={['ADMIN', 'CONTRIBUTOR']}>
            <AppLayout><ArticleComposer /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="ADMIN">
            <AppLayout><UserManagement /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/loans"
        element={
          <ProtectedRoute role="ADMIN">
            <AppLayout><LoanManagement /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/hardware"
        element={
          <ProtectedRoute role="ADMIN">
            <AppLayout><HardwareManagement /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
