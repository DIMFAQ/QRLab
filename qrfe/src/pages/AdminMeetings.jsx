import React, { useState, useEffect } from 'react';
import api from '../api';
import MeetingForm from './MeetingForm';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [activeQr, setActiveQr] = useState(null);
  const [error, setError] = useState('');

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/admin/meetings');
      setMeetings(response.data);
      const openMeeting = response.data.find((m) => m.is_open);
      if (openMeeting) await fetchActiveQr(openMeeting.id);
      else setActiveQr(null);
    } catch {
      setError('Gagal memuat daftar pertemuan.');
    }
  };

  const fetchActiveQr = async (meetingId) => {
    try {
      const response = await api.get(`/admin/meetings/${meetingId}/active-qr`);
      setActiveQr(response.data);
    } catch {
      setActiveQr(null);
    }
  };

  const handleMeetingCreated = (newMeetingData) => {
    fetchMeetings();
    setActiveQr(newMeetingData);
  };

  const handleCloseMeeting = async (meetingId) => {
    if (!window.confirm('Yakin ingin menutup sesi presensi ini?')) return;
    try {
      await api.post(`/admin/meetings/${meetingId}/close`);
      fetchMeetings();
      setActiveQr(null);
      alert('Sesi presensi berhasil ditutup!');
    } catch {
      setError('Gagal menutup sesi.');
    }
  };

  useEffect(() => {
    fetchMeetings();
    const intervalId = setInterval(fetchMeetings, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-indigo-700">
        📋 Manajemen Pertemuan Praktikum
      </h2>

      {/* Form Buat Pertemuan */}
      <div className="mb-8 border p-5 rounded-xl bg-white shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          ➕ Buat Sesi Pertemuan Baru
        </h3>
        <MeetingForm onMeetingCreated={handleMeetingCreated} activeQr={activeQr} />
      </div>

      {/* QR Aktif */}
      {activeQr && activeQr.qr_token && (
        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-300 rounded-xl text-center shadow-md">
          <h3 className="text-2xl font-bold text-indigo-700 mb-3">🎟️ QR Presensi Aktif</h3>
          <p className="text-sm text-gray-700 mb-3">
            Token untuk Pertemuan ID: <span className="font-semibold">{activeQr.meeting_id}</span>
          </p>
          <div className="flex justify-center mb-3">
            <div className="p-4 bg-white border-4 border-gray-800 rounded-lg">
              <QRCode value={activeQr.qr_token} size={220} level="H" />
            </div>
          </div>
          <p className="text-xs text-red-600">
            ⏰ Kadaluwarsa: {new Date(activeQr.expires_at).toLocaleTimeString()}
          </p>
          <button
            onClick={() => handleCloseMeeting(activeQr.meeting_id)}
            className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 w-full sm:w-auto"
          >
            Tutup Sesi Presensi
          </button>
        </div>
      )}

      {/* Riwayat Pertemuan */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">🕓 Riwayat Pertemuan</h3>

        {meetings.length === 0 && (
          <p className="text-gray-500 italic text-center">Belum ada pertemuan tercatat.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {meetings.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-lg shadow transition-transform transform hover:scale-[1.02] ${
                m.is_open
                  ? 'bg-yellow-50 border-l-4 border-yellow-500'
                  : 'bg-gray-50 border-l-4 border-gray-400'
              }`}
            >
              <p className="font-semibold text-gray-800 mb-1">
                {m.name} - Pertemuan Ke-{m.meeting_number}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Status: <span className="font-medium">{m.is_open ? '🟢 AKTIF' : '🔴 TUTUP'}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">Hadir: {m.attendances_count ?? 0}</p>
              <button
                className="text-indigo-600 text-sm hover:underline font-medium"
                onClick={() => alert(`Lihat Rekap Meeting ID: ${m.id}`)}
              >
                📄 Lihat Rekap
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 mt-4 text-center text-sm">{error}</p>}
    </div>
  );
};

export default AdminMeetings;
