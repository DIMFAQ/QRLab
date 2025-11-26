import React, { useState } from 'react';
import api from '../api'; // Import api yang sudah ada

// Komponen Ikon QR (dibuat ulang dengan Tailwind agar skalabel)
const QRIcon = () => (
  <div className="w-16 h-16 bg-[#076BB2] rounded-2xl shadow-lg p-3 grid grid-cols-2 gap-[5px]">
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
  </div>
);

// Nama komponen diubah jadi Login (sesuai nama file)
function Login({ onLogin }) { 
  // --- LOGIKA DARI FILE ASLI ANDA ---
  // Kita gunakan 'username' agar sesuai dengan UI, bukan 'email'
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Tambahan dari UI baru

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setMsg('');
    try {
      // Langsung kirim request login (tanpa CSRF cookie untuk API token)
      const { data } = await api.post('/login', { 
        email: username,
        password: password 
      });
      
      const token = data.token;
      const user  = data.user ?? data;
      localStorage.setItem('authToken', token);
      onLogin?.(user, token);
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Gagal login. Cek username/password.';
      setMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  // --- AKHIR LOGIKA ---

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E9E9E9] p-4 font-arimo">
      <div className="w-full max-w-sm">
        
        {/* --- Bagian Logo dan Judul --- */}
        <div className="flex flex-col items-center mb-4">
          <QRIcon />
          <h1 
            className="text-5xl text-black font-arya mt-4" 
            style={{ textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
          >
            QR-Lab
          </h1>
          <p className="text-base text-gray-900 mt-1">
            Sistem Presensi Digital
          </p>
        </div>

        {/* --- Kartu Form Login --- */}
        <div 
          className="bg-white rounded-2xl p-7" 
          style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.30)' }}
        >
          {/* Form sekarang memiliki handler onSubmit */}
          <form onSubmit={submit}>
            {/* --- Input Username --- */}
            <div className="mb-4">
              <label className="block text-sm text-gray-900 mb-1" htmlFor="username">
                Email
              </label>
              <input
                type="email"
                id="username"
                placeholder="Masukkan email"
                className="w-full px-4 py-2.5 bg-[#E9E9E9] rounded-lg text-sm text-gray-900 placeholder:text-[#717171] focus:outline-none focus:ring-2 focus:ring-[#076BB2]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* --- Input Password --- */}
            <div className="mb-2">
              <label className="block text-sm text-gray-900 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Masukkan password"
                  className="w-full px-4 py-2.5 bg-[#E9E9E9] rounded-lg text-sm text-gray-900 placeholder:text-[#717171] focus:outline-none focus:ring-2 focus:ring-[#076BB2]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#076BB2] text-sm font-semibold"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* --- Pesan Error (dari file asli) --- */}
            {msg && <p className="text-sm text-center text-red-600 mb-3">{msg}</p>}

            {/* --- Tombol Masuk --- */}
            <button
              type="submit" // Tipe submit untuk memicu form
              disabled={loading} // Disable saat loading (dari file asli)
              className="w-full bg-[#076BB2] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-blue-800 transition duration-300 disabled:opacity-50"
            >
              {/* Teks tombol dinamis (dari file asli) */}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* --- Footer --- */}
        <div className="text-center text-xs text-gray-900 mt-12">
          © 2025 QR-Lab Unila | Fakultas Teknik
        </div>
      </div>
    </div>
  );
}

// Pastikan export default
export default Login;