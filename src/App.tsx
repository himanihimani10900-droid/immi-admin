import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load the VEVO Panel
const VevoPanel = React.lazy(() => import("./components/VisaDetailsfeilds"));

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <AdminDashboard /> : <LoginPage />}
        />
        <Route
          path="/vevo"
          element={
            isAuthenticated ? <VevoPanel /> : <Navigate to="/" replace />
          }
        />
        {/* Optional: Add a catch-all for unknown routes */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/"} replace />}
        />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
