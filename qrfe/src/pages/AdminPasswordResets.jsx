import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminPasswordResets() {
  const [pendingResets, setPendingResets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPendingResets();
  }, []);

  const fetchPendingResets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/pending-password-resets');
      setPendingResets(data.pending_resets);
    } catch (err) {
      setError('Gagal memuat data. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!confirm('Setujui reset password untuk user ini?')) return;

    try {
      const { data } = await api.post(`/admin/approve-password-reset/${userId}`);
      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchPendingResets(); // Refresh list
    } catch (err) {
      alert('Gagal menyetujui: ' + (err.response?.data?.message || ''));
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Tolak reset password untuk user ini?')) return;

    try {
      const { data } = await api.post(`/admin/reject-password-reset/${userId}`);
      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchPendingResets(); // Refresh list
    } catch (err) {
      alert('Gagal menolak: ' + (err.response?.data?.message || ''));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {pendingResets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg 
            className="w-16 h-16 text-gray-300 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Tidak Ada Permintaan Pending
          </h3>
          <p className="text-gray-500">
            Semua permintaan reset password sudah diproses
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu Request
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingResets.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(user.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="text-green-600 hover:text-green-900 mr-3 px-3 py-1 rounded-md hover:bg-green-50 transition-colors"
                      >
                        ✓ Setujui
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        ✗ Tolak
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg 
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informasi:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>User dengan password reset pending tidak dapat login</li>
              <li>Setujui: Password baru akan aktif & user dapat login</li>
              <li>Tolak: Password baru dibatalkan, user tetap pakai password lama</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
