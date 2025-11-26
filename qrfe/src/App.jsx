import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import api from "./api";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminKelolaSesi from "./pages/AdminKelolaSesi";
import AdminKelolaMahasiswa from "./pages/AdminKelolaMahasiswa";
import AdminRekapAbsensi from "./pages/AdminRekapAbsensi";
import AdminKelolaEnrollment from "./pages/AdminKelolaEnrollment";

import Login from "./components/login";

import PraktikanDashboard from "./pages/PraktikanDashboard";
import ProfileSettings from "./pages/ProfileSettings";

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const isAuthRoute =
    location.pathname.startsWith("/login");

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPraktikanRoute = location.pathname.startsWith("/praktikan");

  const fetchUser = async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const res = await api.get("/me");
        setUser(res.data?.user ?? res.data ?? null);
      } catch (e) {
        localStorage.removeItem("authToken");
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem("authToken", token);
    setUser(userData?.user ?? userData ?? null);
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {}
    localStorage.removeItem("authToken");
    setUser(null);
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl">
        Memuat...
      </div>
    );
  }

  const role = user?.role ?? null;
  const isAdmin = role === "admin";
  const isPraktikan = role === "praktikan";

  return (
    <div className="min-h-screen bg-[#E9E9E9] w-full">
      {/* Hilangkan header untuk praktikan */}
      {!isAdminRoute && !isAuthRoute && !isPraktikanRoute && (
        <header className="mb-4 p-4 bg-white shadow">
          <h1 className="font-bold text-xl">QR Absensi Praktikum</h1>
        </header>
      )}

      <Routes>
        {/* AUTH */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={isAdmin ? "/admin" : "/praktikan"} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminLayout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="sesi" element={<AdminKelolaSesi />} />
          <Route path="mahasiswa" element={<AdminKelolaMahasiswa />} />
          <Route path="enrollment" element={<AdminKelolaEnrollment />} />
          <Route path="rekap" element={<AdminRekapAbsensi />} />
        </Route>

        {/* PRAKTIKAN */}
        <Route
          path="/praktikan"
          element={
            isPraktikan ? (
              <PraktikanDashboard user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* PROFILE SETTINGS (Admin & Praktikan) */}
        <Route
          path="/profile"
          element={
            user ? (
              <ProfileSettings />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate
                to={isAdmin ? "/admin" : "/praktikan"}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
