// Isi BARU untuk: qrfe/src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import Login from './components/login';
import AdminMeetings from './components/AdminMeetings';
import PraktikanDashboard from './pages/PraktikanDashboard';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Komponen placeholder untuk halaman baru yang kita tambahkan rutenya
const ProfilePage = () => <div className="text-center p-10 text-xl font-bold">Halaman Profil (TODO)</div>;
const HistoryPage = () => <div className="text-center p-10 text-xl font-bold">Halaman Riwayat Presensi (TODO)</div>;


export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Normalisasi respons /me -> bisa { user: {...} } atau langsung {...}
  const fetchUser = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Kita konsisten pakai /user (sesuai file api.php Anda)
        const res = await api.get('/user'); 
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
    // userData juga dinormalisasi, jaga-jaga backend kirim { user, token }
    const normalized = userData?.user ?? userData ?? null;
    setUser(normalized);
  };

  // handleLogout dihapus dari sini, karena akan pindah ke sidebar dashboard

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

  return (
    <Router>
      {/* DIV UTAMA: 
        1. Header lama dihapus (untuk menghindari header ganda).
        2. Padding 'p-4 sm:p-8' dihapus (agar dashboard bisa full screen).
      */}
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Login */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={isAdmin ? '/admin' : '/praktikan'} replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
        <Route path="/register" element={user ? <Navigate to={isAdmin ? "/admin" : "/praktikan"} /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
          {/* Admin */}
          <Route
            path="/admin"
            element={isAdmin ? <AdminMeetings /> : <Navigate to="/login" replace />}
          />

          {/* Praktikan (Mengirim 'user' sebagai prop) */}
          <Route
            path="/praktikan"
            element={isPraktikan ? <PraktikanDashboard user={user} /> : <Navigate to="/login" />} />

          {/* RUTE BARU:
            Ini ditambahkan agar link di sidebar dan profil berfungsi.
          */}
          <Route 
            path="/profil" 
            element={isPraktikan ? <ProfilePage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/riwayat" 
            element={isPraktikan ? <HistoryPage /> : <Navigate to="/login" />} 
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <Navigate
                to={user ? (isAdmin ? '/admin' : '/praktikan') : '/login'}
                replace
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}