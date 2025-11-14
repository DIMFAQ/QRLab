import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

// Komponen Ikon QR (sama seperti di login)
const QRIcon = () => (
  <div className="w-16 h-16 bg-[#076BB2] rounded-2xl shadow-lg p-3 grid grid-cols-2 gap-[5px]">
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
  </div>
);

function Register() {
  // State dari file asli
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState(''); // State untuk konfirmasi password
  const [memberId, setMemberId] = useState(''); // Ini untuk NPM
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // State UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setIsSuccess(false);

    // !! INI BAGIAN YANG DIPERBAIKI !!
    // Kita kirim data sesuai yang diminta AuthController.php
    // 1. 'student_id' (bukan member_id)
    // 2. 'password_confirmation'
    
    try {
      await api.post('/register', { 
        name: name, 
        email: email, 
        student_id: memberId, // DIGANTI dari member_id
        password: password,
        password_confirmation: passwordConfirm // DITAMBAHKAN
      }); 
      
      setIsSuccess(true);
      setMsg('Registrasi berhasil! Cek email untuk verifikasi. Anda akan dialihkan ke login...');
      
      // Kosongkan form
      setName('');
      setEmail('');
      setMemberId('');
      setPassword('');
      setPasswordConfirm('');

      // Tunggu 3 detik lalu redirect ke login
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setIsSuccess(false);
      const errorMsg = err.response?.data?.message || 'Gagal register.';
      
      // Ini akan menangkap error validasi dari backend (seperti di screenshot)
      if (err.response?.data?.errors) {
        // Menggabungkan semua pesan error validasi jadi satu string
        const errors = Object.values(err.response.data.errors).flat().join(' ');
        setMsg(errors);
      } else {
        setMsg(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };
  // --- AKHIR PERBAIKAN ---

  // Kelas utility untuk input
  const inputClass = "w-full px-4 py-2.5 bg-[#E9E9E9] rounded-lg text-sm text-gray-900 placeholder:text-[#717171] focus:outline-none focus:ring-2 focus:ring-[#076BB2]";

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E9E9E9] p-4 font-arimo">
      <div className="w-full max-w-md my-12">
        
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

        {/* --- Kartu Form Daftar --- */}
        <div 
          className="bg-white rounded-2xl p-7" 
          style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.30)' }}
        >
          <h2 className="text-base font-bold text-gray-900">
            Daftar Akun
          </h2>
          <p className="text-sm text-[#717171] mb-5">
            Daftar sebagai mahasiswa
          </p>
          
          <form onSubmit={submit}>
            {/* --- Input Nama Lengkap --- */}
            <div className="mb-4">
              <label className="block text-sm text-gray-900 mb-1" htmlFor="name">
                Nama Lengkap
              </label>
              <input
                type="text" id="name" placeholder="Masukkan nama lengkap Anda"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* --- Input NPM --- */}
            <div className="mb-4">
              <label className="block text-sm text-gray-900 mb-1" htmlFor="npm">
                NPM
              </label>
              <input
                type="text" id="npm" placeholder="Masukkan NPM Anda"
                className={inputClass}
                value={memberId} // Terhubung ke state 'memberId'
                onChange={(e) => setMemberId(e.target.value)}
                required
              />
            </div>

            {/* --- Input Alamat Email --- */}
            <div className="mb-4">
              <label className="block text-sm text-gray-900 mb-1" htmlFor="email">
                Alamat Email
              </label>
              <input
                type="email" id="email" placeholder="Masukkan alamat email Anda"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* --- Input Password --- */}
            <div className="mb-4">
              <label className="block text-sm text-gray-900 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password" placeholder="Masukkan Password Anda"
                  className={inputClass}
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

            {/* --- Input Konfirmasi Password --- */}
            <div className="mb-5">
              <label className="block text-sm text-gray-900 mb-1" htmlFor="passwordConfirm">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="passwordConfirm" placeholder="Konfirmasi Password Anda"
                  className={inputClass}
                  value={passwordConfirm} // Terhubung ke state 'passwordConfirm'
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#076BB2] text-sm font-semibold"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* --- Pesan Status (Error / Sukses) --- */}
            {msg && (
              <p className={`text-sm text-center mb-3 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {msg}
              </p>
            )}

            {/* --- Tombol Daftar --- */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#076BB2] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-blue-800 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Daftar Akun'}
            </button>
          </form>

          {/* --- Link Login --- */}
          <p className="text-center text-sm text-gray-900 mt-8">
            Sudah punya akun?{' '}
            <Link 
              to="/login" 
              className="text-[#076BB2] hover:underline"
            >
              Masuk Sekarang
            </Link>
          </p>
        </div>

        {/* --- Footer --- */}
        <div className="text-center text-xs text-gray-900 mt-12">
          © 2025 QR-Lab Unila | Fakultas Teknik
        </div>
      </div>
    </div>
  );
}

export default Register;