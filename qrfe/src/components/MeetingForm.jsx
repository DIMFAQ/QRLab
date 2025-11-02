import React, { useState } from 'react';
import api from '../api';

export default function MeetingForm({ onMeetingCreated, activeQr }) {
  const [formData, setFormData] = useState({
    name: 'Algoritma & Struktur Data',
    meeting_number: 1,
    qr_duration_minutes: 5,
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (activeQr) return alert('Tutup dulu sesi yang sedang aktif.');
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/admin/meetings', formData);
      onMeetingCreated?.(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal membuat pertemuan.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="text-sm font-medium text-slate-700">Nama Kelas</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
          className={inputClass}
          placeholder="Contoh: Algoritma & Struktur Data"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Pertemuan Ke-</label>
        <input
          type="number"
          name="meeting_number"
          value={formData.meeting_number}
          onChange={onChange}
          min={1}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Durasi QR (menit)</label>
        <input
          type="number"
          name="qr_duration_minutes"
          value={formData.qr_duration_minutes}
          onChange={onChange}
          min={1}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Waktu Mulai</label>
        <input
          type="datetime-local"
          name="start_time"
          value={formData.start_time}
          onChange={onChange}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Waktu Selesai</label>
        <input
          type="datetime-local"
          name="end_time"
          value={formData.end_time}
          onChange={onChange}
          required
          className={inputClass}
        />
      </div>

      {error && (
        <p className="sm:col-span-2 text-sm text-red-600 rounded-md bg-red-50 border border-red-200 p-2">
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={loading || !!activeQr}
          className="w-full rounded-xl bg-blue-600 py-2.5 text-white font-semibold shadow hover:bg-blue-700 active:scale-[.98] disabled:bg-slate-400 transition"
        >
          {loading ? 'Membuat Sesi…' : activeQr ? 'Sesi Aktif' : 'Buat & Generate QR'}
        </button>
      </div>
    </form>
  );
}
