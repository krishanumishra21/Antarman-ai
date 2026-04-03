// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth }   from "./utils/AuthContext";
import Layout    from "./components/Layout";
import HomePage  from "./pages/HomePage";
import ChatPage  from "./pages/ChatPage";
import AuthPage  from "./pages/AuthPage";

// Protects routes — redirects to /auth if not logged in
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen gap-3 text-forge-muted">
        <span className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
        Loading…
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen gap-3 text-forge-muted">
        <span className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route — redirect to home if already logged in */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <AuthPage />}
      />

      {/* Protected routes */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout><HomePage /></Layout>
        </PrivateRoute>
      }/>

      <Route path="/chat/:id" element={
        <PrivateRoute>
          <Layout><ChatPage /></Layout>
        </PrivateRoute>
      }/>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="noise-overlay min-h-screen">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
}