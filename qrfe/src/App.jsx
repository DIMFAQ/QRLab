import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
// KOREKSI AKHIR: Path import dibuat huruf kecil (login) untuk mencocokkan nama file Anda.
// Variabel 'Login' tetap kapital (standar JSX)
import Login from './components/login'; 
import AdminQrManager from './components/AdminQrManager'; 
import QrCheckIn from './components/QrCheckIn'; 

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const response = await api.get('/me'); 
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('authToken');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleLogin = (userData, token) => {
        localStorage.setItem('authToken', token);
        setUser(userData);
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout'); 
        } catch(e) {}
        localStorage.removeItem('authToken');
        setUser(null);
    };

    if (loading) return (
        <div className="text-center p-10 text-3xl font-semibold text-indigo-700 min-h-screen">
            Memuat Aplikasi...
        </div>
    );

    const isAdmin = user && user.role === 'admin';
    const isPraktikan = user && user.role === 'praktikan';

    return (
        <Router>
            <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
                <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-indigo-700">QR Absensi Praktikum</h1>
                    {user && (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600 hidden sm:inline">Logged in as: **{user.name}** ({user.role})</span>
                            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-150">Logout</button>
                        </div>
                    )}
                </header>

                <Routes>
                    {/* Penggunaan komponen harus tetap <Login /> */}
                    <Route path="/login" element={user ? <Navigate to={isAdmin ? "/admin" : "/praktikan"} /> : <Login onLogin={handleLogin} />} />
                    
                    <Route path="/admin" element={isAdmin ? <AdminQrManager /> : <Navigate to="/login" />} />
                    
                    <Route path="/praktikan" element={isPraktikan ? <QrCheckIn user={user} /> : <Navigate to="/login" />} />
                    
                    <Route path="*" element={<Navigate to={user ? (isAdmin ? "/admin" : "/praktikan") : "/login"} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;