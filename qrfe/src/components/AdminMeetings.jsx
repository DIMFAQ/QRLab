import React, { useState, useEffect } from 'react';
import api from '../api';
import MeetingForm from './MeetingForm';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

export default function AdminMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [activeQr, setActiveQr] = useState(null);
  const [error, setError] = useState('');
  const [rekapModal, setRekapModal] = useState({ open: false, data: null });

  const fetchMeetings = async () => {
    try {
      const { data } = await api.get('/admin/meetings');
      setMeetings(data);
      const open = data.find((m) => m.is_open);
      if (open) await fetchActiveQr(open.id);
      else setActiveQr(null);
    } catch {
      setError('Gagal memuat daftar pertemuan.');
    }
  };

  const fetchActiveQr = async (meetingId) => {
    try {
      const { data } = await api.get(`/admin/meetings/${meetingId}/active-qr`);
      setActiveQr(data);
    } catch {
      setActiveQr(null);
    }
  };

  const handleMeetingCreated = (payload) => {
    fetchMeetings();
    setActiveQr(payload);
  };

  const handleCloseMeeting = async (meetingId) => {
    if (!confirm('Tutup sesi presensi ini?')) return;
    try {
      await api.post(`/admin/meetings/${meetingId}/close`);
      await fetchMeetings();
      setActiveQr(null);
    } catch {
      setError('Gagal menutup sesi.');
    }
  };

  const handleShowRekap = async (meetingId) => {
    try {
      const res = await api.get(`/admin/meetings/${meetingId}/rekap`);
      setRekapModal({ open: true, data: res.data });
    } catch {
      alert('Gagal memuat rekap presensi');
    }
  };

  const closeRekap = () => setRekapModal({ open: false, data: null });

  useEffect(() => {
    fetchMeetings();
    const id = setInterval(fetchMeetings, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 shadow">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-wide">QR Absensi • Admin</h1>
          <span className="text-xs bg-white/15 px-2 py-1 rounded-full">v1.0</span>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-5">
        {/* Form Card */}
        <section className="rounded-2xl bg-white shadow-md ring-1 ring-slate-200 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Buat Pertemuan</h2>
          <MeetingForm onMeetingCreated={handleMeetingCreated} activeQr={activeQr} />
        </section>

        {/* Active QR */}
        {activeQr?.qr_token && (
          <section className="mt-5 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 ring-1 ring-blue-200 shadow p-5 text-center">
            <h3 className="text-lg font-bold text-blue-700 mb-2">QR Presensi Aktif</h3>
            <p className="text-sm text-slate-700 mb-3">
              Pertemuan ID: <span className="font-semibold">{activeQr.meeting_id}</span>
            </p>
            <div className="mx-auto w-fit rounded-xl border-4 border-slate-900 bg-white p-3">
              <QRCode value={activeQr.qr_token} size={220} level="H" />
            </div>
            <p className="mt-3 text-xs text-red-600">
              ⏰ Kadaluarsa: {new Date(activeQr.expires_at).toLocaleTimeString()}
            </p>
            <button
              onClick={() => handleCloseMeeting(activeQr.meeting_id)}
              className="mt-4 w-full sm:w-auto rounded-xl bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 active:scale-[.98] transition"
            >
              Tutup Sesi Presensi
            </button>
          </section>
        )}

        {/* Riwayat Pertemuan */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-800">Riwayat Pertemuan</h3>
          </div>

          {meetings.length === 0 ? (
            <p className="text-center text-slate-500 italic">Belum ada pertemuan.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {meetings.map((m) => (
                <article
                  key={m.id}
                  className={`rounded-xl p-4 shadow-sm ring-1 transition hover:shadow ${
                    m.is_open
                      ? 'bg-yellow-50 ring-yellow-200'
                      : 'bg-white ring-slate-200'
                  }`}
                >
                  <h4 className="font-semibold text-slate-800">
                    {m.name} — <span className="text-slate-600">Pert. {m.meeting_number}</span>
                  </h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Status: {m.is_open ? '🟢 AKTIF' : '🔴 TUTUP'}
                  </p>
                  <p className="text-sm text-slate-600">
                    Hadir: <span className="font-medium">{m.attendances_count ?? 0}</span>
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleShowRekap(m.id)}
                      className="flex-1 text-sm font-medium text-blue-600 hover:underline"
                    >
                      Lihat Rekap
                    </button>

                    {m.is_open && (
                      <button
                        onClick={() => handleCloseMeeting(m.id)}
                        className="flex-1 bg-red-600 text-white text-sm font-semibold rounded-lg px-3 py-1 hover:bg-red-700 active:scale-95 transition"
                      >
                        Tutup Sesi
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {error && (
          <p className="mt-4 text-center text-sm font-medium text-red-600">{error}</p>
        )}
      </main>

      {/* Floating Modal Rekap */}
      {rekapModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-5 animate-fade-in">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">
              Rekap Presensi
            </h3>

            {rekapModal.data && rekapModal.data.length > 0 ? (
              <ul className="divide-y divide-slate-200 max-h-64 overflow-y-auto">
                {rekapModal.data.map((a, i) => (
                  <li key={i} className="py-2 flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">{a.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        a.status === 'Hadir'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate-500 italic">Belum ada data hadir.</p>
            )}

            <button
              onClick={closeRekap}
              className="mt-4 w-full rounded-xl bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 active:scale-[.98] transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
