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

      const openMeeting = data.find((m) => m.is_open);
      if (openMeeting) {
        await fetchActiveQr(openMeeting.id);
      } else {
        setActiveQr(null);
      }
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

  const handleMeetingCreated = (newMeeting) => {
    fetchMeetings();
    setActiveQr(newMeeting);
  };

  const handleCloseMeeting = async (meetingId) => {
    if (!window.confirm('Tutup sesi presensi ini?')) return;

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
      const { data } = await api.get(`/admin/meetings/${meetingId}/rekap`);
      setRekapModal({ open: true, data });
    } catch {
      alert('Gagal memuat rekap presensi');
    }
  };

  const closeRekap = () =>
    setRekapModal({ open: false, data: null });

  useEffect(() => {
    fetchMeetings();
    const interval = setInterval(fetchMeetings, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 shadow">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold">QR Absensi • Admin</h1>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">v1.0</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* FORM CREATE */}
        <section className="bg-white p-6 rounded-2xl shadow ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Buat Pertemuan</h2>
          <MeetingForm onMeetingCreated={handleMeetingCreated} activeQr={activeQr} />
        </section>

        {/* ACTIVE QR */}
        {activeQr?.qr_token && (
          <section className="mt-6 bg-gradient-to-br from-blue-100 to-blue-50 p-5 rounded-2xl text-center ring-1 ring-blue-200 shadow">
            <h3 className="text-lg font-bold text-blue-700">QR Presensi Aktif</h3>
            <p className="text-sm text-slate-600 mb-3">
              Pertemuan ID: <b>{activeQr.meeting_id}</b>
            </p>

            <div className="mx-auto w-fit border-4 border-slate-900 rounded-xl bg-white p-3">
              <QRCode value={activeQr.qr_token} size={220} level="H" />
            </div>

            <p className="mt-2 text-xs text-red-600">
              Kadaluwarsa: {new Date(activeQr.expires_at).toLocaleTimeString()}
            </p>

            <button
              onClick={() => handleCloseMeeting(activeQr.meeting_id)}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl w-full sm:w-auto"
            >
              Tutup Sesi Presensi
            </button>
          </section>
        )}

        {/* MEETING HISTORY */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Riwayat Pertemuan</h3>

          {meetings.length === 0 ? (
            <p className="text-center text-slate-500 italic">Belum ada pertemuan.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {meetings.map((m) => (
                <article
                  key={m.id}
                  className={`p-4 rounded-xl shadow transition ring-1 ${
                    m.is_open ? 'bg-yellow-50 ring-yellow-300' : 'bg-white ring-slate-200'
                  }`}
                >
                  <h4 className="font-semibold">
                    {m.name} — <span className="text-slate-600">Pert. {m.meeting_number}</span>
                  </h4>

                  <p className="text-sm mt-1">Status: {m.is_open ? '🟢 AKTIF' : '🔴 TUTUP'}</p>
                  <p className="text-sm">Hadir: {m.attendances_count ?? 0}</p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleShowRekap(m.id)}
                      className="text-sm text-blue-600 hover:underline flex-1"
                    >
                      Lihat Rekap
                    </button>

                    {m.is_open && (
                      <button
                        onClick={() => handleCloseMeeting(m.id)}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 flex-1"
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

        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </main>

      {/* MODAL REKAP */}
      {rekapModal.open && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-2xl w-[90%] max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">
              Rekap Presensi
            </h3>

            {rekapModal.data?.length > 0 ? (
              <ul className="divide-y divide-slate-200 max-h-64 overflow-y-auto">
                {rekapModal.data.map((a, i) => (
                  <li key={i} className="py-2 flex justify-between text-sm">
                    <span>{a.name}</span>
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
              className="mt-4 bg-blue-600 text-white py-2 rounded-xl w-full hover:bg-blue-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
