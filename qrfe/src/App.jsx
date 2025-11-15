import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import Login from './components/login';
import AdminMeetings from './components/AdminMeetings';
import QrScannerComponent from './components/QrScanner';
import PraktikanDashboard from './pages/PraktikanDashboard';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Fungsi untuk mendapatkan data pengguna saat token tersedia
  const fetchUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        setUser(null);
        setIsAuthChecking(false);
        return;
    }

    try {
        const res = await api.get('/me');
        const normalized = res?.data?.user ?? res?.data ?? null;
        setUser(normalized);
        localStorage.setItem('userRole', normalized?.role ?? '');
    } catch (e) {
        // Token tidak valid/expired, bersihkan storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setUser(null);
    } finally {
        setIsAuthChecking(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('authToken', token);
    const normalized = userData?.user ?? userData ?? null;
    setUser(normalized);
    localStorage.setItem('userRole', normalized?.role ?? '');
    // Tidak perlu memanggil fetchUser() atau setIsAuthChecking(true) lagi, 
    // karena state setUser sudah memicu render ulang.
  };

  const handleLogout = async () => {
    // PERBAIKAN: Mengabaikan error 401 Unauthorized saat logout karena token sudah dihapus di sisi client
    try { 
        await api.post('/logout'); 
    } catch (e) {
        console.error("Logout API failed or token expired, cleaning client state.", e);
    }
    
    // Ini harus dijalankan terlepas dari hasil request backend
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setUser(null);
    setIsAuthChecking(false);
  };

  // ----------------------------------------------------
  // PENCEGAH LAYAR PUTIH DAN PENANGANAN LOADING
  // ----------------------------------------------------
  if (isAuthChecking) {
    return (
      <div className="text-center p-10 text-3xl font-semibold text-indigo-700 min-h-screen">
        Memuat Aplikasi...
      </div>
    );
  }

  const role = user?.role ?? null;
  const isAdmin = role === 'admin';
  const isPraktikan = role === 'praktikan';
  const isLoggedIn = !!user;

  // Helper untuk menentukan path dashboard yang benar
  const getDashboardPath = () => isAdmin ? '/admin' : '/praktikan';


  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
        <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-indigo-700">QR Absensi Praktikum</h1>
          {isLoggedIn && (
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

        <Routes>
          {/* 1. RUTE UTAMA (ROOT PATH) - Mencegah Loop dari /login */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to={getDashboardPath()} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* 2. Rute Login & Auth Lain */}
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to={getDashboardPath()} replace /> : <Login onLogin={handleLogin} />}
          />
          <Route path="/register" element={isLoggedIn ? <Navigate to={getDashboardPath()} /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 3. Rute Admin (Terproteksi) */}
          <Route
            path="/admin"
            element={isAdmin ? <AdminMeetings /> : <Navigate to={isLoggedIn ? getDashboardPath() : '/login'} replace />}
          />

          {/* 4. Rute Praktikan (Terproteksi) */}
          <Route
            path="/praktikan"
            element={isPraktikan ? <PraktikanDashboard user={user} /> : <Navigate to={isLoggedIn ? getDashboardPath() : '/login'} />} />

          {/* 5. Rute Scanner (Terproteksi) */}
          <Route
             path="/scan"
             element={isLoggedIn ? <QrScannerComponent /> : <Navigate to="/login" />}
          />

          {/* 6. FALLBACK (404 Not Found) - Mengganti Fallback Loop yang Lama */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </div>
    </Router>
  );
}

// Komponen sederhana untuk 404 Not Found
const NotFound = () => (
    <div className="text-center p-20 text-red-500 text-xl">
        404 | Halaman Tidak Ditemukan
    </div>
);