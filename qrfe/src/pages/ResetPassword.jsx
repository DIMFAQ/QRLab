import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setLoading(true);

    try {
      await api.post('/reset-password', {
        email,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });
      navigate('/reset-success');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
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
          <h2 className="text-base font-bold text-gray-900 mb-2">
            Buat Password Baru
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Buat Password yang berbeda dari sebelumnya
          </p>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-center text-red-600 mb-3">{error}</p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-900 mb-1" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Masukkan Password Anda"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-[#E9E9E9] rounded-lg text-sm text-gray-900 placeholder:text-[#717171] focus:outline-none focus:ring-2 focus:ring-[#076BB2]"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-900 mb-1" htmlFor="password_confirmation">
                Konfirmasi Password
              </label>
              <input
                type="password"
                id="password_confirmation"
                required
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                placeholder="Konfirmasi Password Anda"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-[#E9E9E9] rounded-lg text-sm text-gray-900 placeholder:text-[#717171] focus:outline-none focus:ring-2 focus:ring-[#076BB2]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#076BB2] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-blue-800 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Reset Password'}
            </button>
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
