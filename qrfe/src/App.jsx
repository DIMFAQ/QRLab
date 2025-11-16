import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './api';

// Layout & Halaman Admin (Baru)
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminKelolaSesi from './pages/AdminKelolaSesi';
import AdminKelolaMahasiswa from './pages/AdminKelolaMahasiswa';
import AdminRekapAbsensi from './pages/AdminRekapAbsensi';

// Halaman Lain
import Login from './components/login';
import QrScannerComponent from './components/QrScanner';
import PraktikanDashboard from './pages/PraktikanDashboard';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const isAuthRoute =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password');

  const isAdminRoute = location.pathname.startsWith('/admin');

  const fetchUser = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const res = await api.get('/me');
        const normalized = res?.data?.user ?? res?.data ?? null;
        setUser(normalized);
      } catch (e) {
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('authToken', token);
    const normalized = userData?.user ?? userData ?? null;
    setUser(normalized);
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {}
    localStorage.removeItem('authToken');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="text-center p-10 text-3xl font-semibold text-indigo-700 min-h-screen">
        Memuat Aplikasi...
      </div>
    );
  }

  const role = user?.role ?? null;
  const isAdmin = role === 'admin';
  const isPraktikan = role === 'praktikan';

  const layoutClass = isAdminRoute
    ? 'min-h-screen bg-[#E9E9E9]'
    : isAuthRoute
    ? 'min-h-screen bg-gray-100'
    : 'min-h-screen bg-gray-100 p-4 sm:p-8';

  return (
    <div className={layoutClass}>
      {!isAdminRoute && !isAuthRoute && (
        <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-indigo-700">QR Absensi Praktikum</h1>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden sm:inline">
                Logged in as: <b>{user?.name ?? '-'}</b> ({role ?? '-'})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-150"
              >
                Logout
              </button>
            </div>
          )}
        </header>
      )}

      <Routes>
        {/* Rute Auth */}
        <Route
          path="/login"
          element={user ? <Navigate to={isAdmin ? '/admin' : '/praktikan'} replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to={isAdmin ? '/admin' : '/praktikan'} replace /> : <Register />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rute Admin (Bersarang/Nested) */}
        <Route
          path="/admin"
          element={isAdmin ? <AdminLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="sesi" element={<AdminKelolaSesi />} />
          <Route path="mahasiswa" element={<AdminKelolaMahasiswa />} />
          <Route path="rekap" element={<AdminRekapAbsensi />} />
        </Route>

        {/* Rute Praktikan */}
        <Route
          path="/praktikan"
          element={isPraktikan ? <PraktikanDashboard user={user} /> : <Navigate to="/login" replace />}
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={user ? (isAdmin ? '/admin' : '/praktikan') : '/login'} replace />}
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
