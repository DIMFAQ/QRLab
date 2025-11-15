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
  const [loading, setLoading] = useState(true);
  
  // State untuk melacak apakah otentikasi sedang berjalan (lebih jelas dari hanya 'loading')
  const [isAuthChecking, setIsAuthChecking] = useState(true); 

  // Fungsi untuk mendapatkan data pengguna saat token tersedia
  const fetchUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Jika tidak ada token, set state dan hentikan loading
        setUser(null);
        setIsAuthChecking(false);
        return;
    }
    
    try {
        // Panggil /me untuk memverifikasi token dan mendapatkan data pengguna
        const res = await api.get('/me');
        // Normalisasi response: ambil data dari res.data.user atau res.data
        const normalized = res?.data?.user ?? res?.data ?? null;
        setUser(normalized);
        
        // Simpan role ke localStorage untuk akses cepat jika perlu
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
    // Panggil saat aplikasi dimulai atau setelah logout/login
    fetchUser();
  }, []); // Hanya berjalan saat mount

  const handleLogin = (userData, token) => {
    localStorage.setItem('authToken', token);
    
    // Normalisasi dan set user state secara langsung untuk update UI cepat
    const normalized = userData?.user ?? userData ?? null;
    setUser(normalized);
    localStorage.setItem('userRole', normalized?.role ?? '');

    // Set loading ke true agar App me-render ulang dan memastikan role
    // setIsAuthChecking(true); 
    // fetchUser(); // Optional: Panggil lagi untuk double-check via API
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {} // Coba logout di backend
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setUser(null);
    setIsAuthChecking(false); // Langsung selesai checking
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
          {/* Rute Login & Auth Lain */}
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to={isAdmin ? '/admin' : '/praktikan'} replace /> : <Login onLogin={handleLogin} />}
          />
          <Route path="/register" element={isLoggedIn ? <Navigate to={isAdmin ? "/admin" : "/praktikan"} /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Rute Admin (Terproteksi) */}
          <Route
            path="/admin"
            element={isAdmin ? <AdminMeetings /> : <Navigate to={isLoggedIn ? '/praktikan' : '/login'} replace />}
          />

          {/* Rute Praktikan (Terproteksi) */}
          <Route
            path="/praktikan"
            element={isPraktikan ? <PraktikanDashboard user={user} /> : <Navigate to={isLoggedIn ? '/admin' : '/login'} />} />

          {/* Rute Scanner (Asumsi ini rute kamera) */}
          <Route 
             path="/scan" 
             element={isLoggedIn ? <QrScannerComponent /> : <Navigate to="/login" />} 
          />

          {/* Fallback (Jika rute tidak ditemukan) */}
          <Route
            path="*"
            element={
              <Navigate
                to={isLoggedIn ? (isAdmin ? '/admin' : '/praktikan') : '/login'}
                replace
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}