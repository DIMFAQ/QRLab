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

  // Normalisasi respons /me -> bisa { user: {...} } atau langsung {...}
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
    // userData juga dinormalisasi, jaga-jaga backend kirim { user, token }
    const normalized = userData?.user ?? userData ?? null;
    setUser(normalized);
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {}
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

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
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

          {/* Praktikan */}
          <Route
            path="/praktikan"
            element={isPraktikan ? <PraktikanDashboard user={user} /> : <Navigate to="/login" />} />

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
