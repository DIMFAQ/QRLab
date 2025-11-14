import React, { useState, useEffect } from 'react';
import api from '../api';

function AdminUserVerification() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fungsi untuk mengambil data user yang pending
  const fetchPendingUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/users/pending');
      setPendingUsers(data);
    } catch (err) {
      setError('Gagal memuat data antrian.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Ambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Fungsi untuk menyetujui user
  const handleApprove = async (userId) => {
    setSuccess('');
    setError('');
    
    // Konfirmasi sederhana
    if (!window.confirm('Anda yakin ingin menyetujui user ini?')) {
      return;
    }

    try {
      // Panggil API untuk approve
      const { data } = await api.post(`/admin/users/${userId}/approve`);
      setSuccess(data.message); // Tampilkan pesan sukses
      
      // Hapus user yang baru disetujui dari daftar di state
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyetujui user.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow ring-1 ring-slate-200 mt-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Antrian Verifikasi Praktikan</h2>
      
      {loading && <p>Memuat data...</p>}
      
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-2">{success}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NPM</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingUsers.length === 0 && !loading && (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-sm text-gray-500 text-center">
                  Tidak ada praktikan yang menunggu persetujuan.
                </td>
              </tr>
            )}
            {pendingUsers.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-4 text-sm text-gray-900">{user.name}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{user.member?.student_id || 'N/A'}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{user.email}</td>
                <td className="px-4 py-4 text-sm">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    Setujui
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUserVerification;