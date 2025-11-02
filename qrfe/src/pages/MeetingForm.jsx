import React, { useState } from 'react';
import api from '../api';

export default function MeetingForm({ onMeetingCreated, activeQr }) {
  const [formData, setFormData] = useState({
    name: 'Algoritma dan Struktur Data',
    meeting_number: 1,
    qr_duration_minutes: 5,
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeQr) {
      alert('Harap tutup sesi yang aktif terlebih dahulu.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/admin/meetings', formData);
      onMeetingCreated(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pertemuan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"
    >
      <div className="sm:col-span-2">
        <label className="font-medium text-gray-700">Nama Kelas</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400 outline-none transition"
        />
      </div>

      <div>
        <label className="font-medium text-gray-700">Pertemuan Ke-</label>
        <input
          type="number"
          name="meeting_number"
          value={formData.meeting_number}
          onChange={handleChange}
          required
          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div>
        <label className="font-medium text-gray-700">Durasi QR (Menit)</label>
        <input
          type="number"
          name="qr_duration_minutes"
          value={formData.qr_duration_minutes}
          onChange={handleChange}
          required
          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div>
        <label className="font-medium text-gray-700">Mulai</label>
        <input
          type="datetime-local"
          name="start_time"
          value={formData.start_time}
          onChange={handleChange}
          required
          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div>
        <label className="font-medium text-gray-700">Selesai</label>
        <input
          type="datetime-local"
          name="end_time"
          value={formData.end_time}
          onChange={handleChange}
          required
          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {error && (
        <p className="sm:col-span-2 text-red-500 text-sm">{error}</p>
      )}

      <div className="sm:col-span-2 mt-2">
        <button
          type="submit"
          disabled={loading || activeQr}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400 transition"
        >
          {loading
            ? 'Membuat Sesi...'
            : activeQr
            ? 'Sesi Aktif'
            : 'Buat Sesi & Generate QR'}
        </button>
      </div>
    </form>
  );
}
