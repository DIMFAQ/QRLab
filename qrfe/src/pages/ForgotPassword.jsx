import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Komponen Ikon QR
const QRIcon = () => (
  <div className="w-16 h-16 bg-[#076BB2] rounded-2xl shadow-lg p-3 grid grid-cols-2 gap-[5px]">
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
  </div>
);

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/forgot-password', { email });
      // Jika berhasil, navigasi ke halaman reset password
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      console.error('Forgot password error:', err);
      // Tampilkan pesan error yang lebih jelas
      if (err.response?.status === 404) {
        setError('Email tidak terdaftar dalam sistem.');
      } else if (err.response?.status === 403) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0]);
      } else {
        setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E9E9E9] p-4 font-arimo">
      <div className="w-full max-w-sm">
        
        {/* Logo dan Judul */}
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

        {/* Kartu Form */}
        <div 
          className="bg-white rounded-2xl p-7" 
          style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.30)' }}
        >
          <h2 className="text-base font-bold text-gray-900 mb-5">
            Lupa Password Anda?
          </h2>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-center text-red-600 mb-3">{error}</p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm text-gray-900 mb-1" htmlFor="email">
                Alamat Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan alamat email Anda"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-[#E9E9E9] rounded-lg text-sm text-gray-900 placeholder:text-[#717171] focus:outline-none focus:ring-2 focus:ring-[#076BB2]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#076BB2] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-blue-800 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Selanjutnya'}
            </button>

            <div className="text-center mt-5">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-[#076BB2] hover:underline bg-transparent border-none cursor-pointer"
              >
                Kembali ke Login
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-900 mt-12">
          © 2025 QR-Lab Unila | Fakultas Teknik
        </div>
      </div>
    </div>
  );
}
