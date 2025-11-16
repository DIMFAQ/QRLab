import React, { useState, useEffect } from 'react';
import api from '../api';
import MeetingForm from '../components/MeetingForm';
import AdminUserVerification from '../components/AdminUserVerification';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

// Impor ikon placeholder (gantilah dengan ikon React jika ada)
const IconPlaceholder = ({ className = "w-6 h-6" }) => <div className={`${className} bg-gray-300 rounded`}></div>;

export default function AdminMeetingsPage({ user, onLogout }) {
  const [meetings, setMeetings] = useState([]);
  const [activeQr, setActiveQr] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rekapModal, setRekapModal] = useState({ open: false, data: null });

  // ... (Semua fungsi helper Anda tetap sama)
  const extractErrorMessage = (err) => {
    try {
      if (err.response) return `HTTP ${err.response.status} — ${err.response.data?.message || JSON.stringify(err.response.data)}`;
      if (err.request) return 'No response received from server (network/CORS/backend down).';
      return err.message || String(err);
    } catch (e) { return String(err); }
  };

  const fetchMeetings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/meetings');
      if (!Array.isArray(data)) {
        setError('Format data tidak sesuai: server mengembalikan bukan array.');
        setMeetings([]);
        setActiveQr(null);
        setLoading(false);
        return;
      }
      setMeetings(data);
      const opened = data.find((m) => m.is_open);
      if (opened) {
        await fetchActiveQr(opened.id);
      } else {
        setActiveQr(null);
      }
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      setMeetings([]);
      setActiveQr(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveQr = async (meetingId) => {
    try {
      const { data } = await api.get(`/admin/meetings/${meetingId}/active-qr`);
      setActiveQr(data);
    } catch (err) {
      setActiveQr(null);
    }
  };

  const handleMeetingCreated = (payload) => {
    fetchMeetings();
    setActiveQr(payload);
  };

  const handleCloseMeeting = async (meetingId) => {
    if (!window.confirm('Tutup sesi presensi ini?')) return;
    try {
      await api.post(`/admin/meetings/${meetingId}/close`);
      await fetchMeetings();
      setActiveQr(null);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
    }
  };

  const handleShowRekap = async (meetingId) => {
    try {
      const { data } = await api.get(`/admin/meetings/${meetingId}/rekap`);
      setRekapModal({ open: true, data });
    } catch (err) {
      const msg = extractErrorMessage(err);
      alert('Gagal memuat rekap presensi: ' + msg);
    }
  };

  const closeRekap = () => setRekapModal({ open: false, data: null });

  useEffect(() => {
    fetchMeetings();
    const interval = setInterval(fetchMeetings, 30000);
    return () => clearInterval(interval);
  }, []);

  // JSX Sidebar dan Navigasi
  const SidebarNav = () => (
    <div className="w-[332px] h-screen bg-white shadow-lg flex flex-col fixed left-0 top-0">
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 p-4 h-[114px] border-b border-gray-200">
        <div className="w-16 h-16 bg-[#076BB2] rounded-2xl flex items-center justify-center p-2">
          {/* Ganti dengan SVG ikon QR Anda */}
          <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        </div>
        <div className="text-3xl font-['Arya'] font-bold text-black">Admin QR-Lab</div>
      </div>

      {/* Navigasi */}
      <nav className="flex-grow p-4 space-y-2">
        {/* Jadikan link "Dashboard" aktif dan yang lain dummy */}
        <a href="#" className="flex items-center gap-4 p-4 rounded-lg text-lg font-bold bg-[#076BB2] text-white">
          <IconPlaceholder />
          Dashboard
        </a>
        <a href="#" className="flex items-center gap-4 p-4 rounded-lg text-lg text-[#717182] font-bold hover:bg-gray-100">
          <IconPlaceholder />
          Kelola Sesi
        </a>
        <a href="#" className="flex items-center gap-4 p-4 rounded-lg text-lg text-[#717182] font-bold hover:bg-gray-100">
          <IconPlaceholder />
          Rekap Absensi
        </a>
        <a href="#" className="flex items-center gap-4 p-4 rounded-lg text-lg text-[#717182] font-bold hover:bg-gray-100">
          <IconPlaceholder />
          Kelola Mahasiswa
        </a>
      </nav>

      {/* Logout di Sidebar Bawah (sesuai gambar) */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="flex items-center px-4 py-2 mt-4 text-red-600 hover:bg-red-100 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );

  // JSX Stats Cards
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Mahasiswa */}
      <div className="bg-white p-6 rounded-lg border-2 border-[rgba(112,112,112,0.63)] flex justify-between items-center">
        <div>
          <div className="text-2xl text-[#717182] mb-2">Total Mahasiswa</div>
          <div className="text-5xl font-bold text-slate-800">137</div>
        </div>
        <div className="w-16 h-16 rounded-full bg-[#C4DBEC] flex items-center justify-center">
          <IconPlaceholder className="w-8 h-8" />
        </div>
      </div>
      {/* Sesi Praktikum Aktif */}
      <div className="bg-white p-6 rounded-lg border-2 border-[rgba(112,112,112,0.63)] flex justify-between items-center">
        <div>
          <div className="text-2xl text-[#717182] mb-2">Sesi Praktikum Aktif</div>
          <div className="text-5xl font-bold text-slate-800">2</div>
        </div>
        <div className="w-16 h-16 rounded-full bg-[rgba(144,226,162,0.79)] flex items-center justify-center">
          <IconPlaceholder className="w-8 h-8" />
        </div>
      </div>
      {/* Kehadiran Hari Ini */}
      <div className="bg-white p-6 rounded-lg border-2 border-[rgba(112,112,112,0.63)] flex justify-between items-center">
        <div>
          <div className="text-2xl text-[#717182] mb-2">Kehadiran Hari Ini</div>
          <div className="text-5xl font-bold text-slate-800">93%</div>
        </div>
        <div className="w-16 h-16 rounded-full bg-[rgba(255,234,0,0.45)] flex items-center justify-center">
          <IconPlaceholder className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
  
  // Konten Asli (Kelola Sesi)
  const OriginalContent = () => (
    <>
      {/* Verifikasi Pengguna (dari file asli Anda) */}
      <div className="container mx-auto p-4 bg-blue-50 rounded-lg shadow mb-6">
        <AdminUserVerification />
      </div>

      {/* Konten Utama (Form, QR, Riwayat) */}
      <main className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow">
        <section className="rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">Buat Pertemuan</h2>
          <MeetingForm onMeetingCreated={handleMeetingCreated} activeQr={activeQr} />
        </section>

        {loading && <div className="text-center text-sm text-slate-600 mb-4">Memuat data…</div>}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            <strong>Error:</strong> {error}
            <div className="mt-2 text-xs text-slate-600">Cek console (F12) & network tab untuk detail.</div>
          </div>
        )}

        {activeQr?.qr_token && (
          <section className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 p-5 ring-1 ring-blue-200 shadow text-center mb-6">
            <h3 className="text-lg font-bold text-blue-700 mb-2">QR Presensi Aktif</h3>
            <p className="text-sm text-slate-700 mb-3">Pertemuan ID: <b>{activeQr.meeting_id}</b></p>
            <div className="mx-auto bg-white border-4 border-slate-900 p-3 rounded-xl w-fit">
              <QRCode value={activeQr.qr_token} size={220} level="H" />
            </div>
            <p className="text-xs text-red-600 mt-2">Kadaluarsa: {new Date(activeQr.expires_at).toLocaleTimeString()}</p>
            <button
              onClick={() => handleCloseMeeting(activeQr.meeting_id)}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
            >
              Tutup Sesi Presensi
            </button>
          </section>
        )}

        <section>
          <h3 className="text-lg font-semibold mb-3">Riwayat Pertemuan</h3>
          {meetings.length === 0 ? (
            <p className="text-center text-slate-500 italic">Belum ada pertemuan.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {meetings.map((m) => (
                <article key={m.id} className={`p-4 rounded-xl shadow ring-1 ${m.is_open ? 'bg-yellow-50 ring-yellow-200' : 'bg-white ring-slate-200'}`}>
                  <h4 className="font-semibold">{m.name} — <span className="text-slate-600">Pert. {m.meeting_number}</span></h4>
                  <p className="text-sm mt-1">Status: {m.is_open ? '🟢 AKTIF' : '🔴 TUTUP'}</p>
                  <p className="text-sm">Hadir: <b>{m.attendances_count ?? 0}</b></p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleShowRekap(m.id)} className="flex-1 text-blue-600 hover:underline text-sm font-medium">Lihat Rekap</button>
                    {m.is_open && <button onClick={() => handleCloseMeeting(m.id)} className="flex-1 bg-red-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-red-700">Tutup Sesi</button>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal Rekap (dari file asli Anda) */}
      {rekapModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-2xl w-[90%] max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">Rekap Presensi</h3>
            {rekapModal.data?.length > 0 ? (
              <ul className="max-h-64 overflow-y-auto divide-y divide-slate-200">
                {rekapModal.data.map((a, i) => (
                  <li key={i} className="py-2 flex justify-between text-sm">
                    <span>{a.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${a.status === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate-500 italic">Belum ada data hadir.</p>
            )}
            <button onClick={closeRekap} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">Tutup</button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex w-full h-full min-h-screen">
      {/* === SIDEBAR BARU === */}
      <SidebarNav />

      {/* === MAIN CONTENT WRAPPER === */}
      <div className="flex-1 flex flex-col ml-[332px]">
        {/* === HEADER BARU === */}
        <header className="h-[114px] bg-white flex justify-between items-center p-8 border-b border-gray-200 sticky top-0 z-10">
          <h1 className="text-4xl font-['Arimo'] font-bold text-slate-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-xl font-['Arimo'] hidden md:inline">{user?.name ?? 'Admin'}</span>
            <img 
              className="w-14 h-14 rounded-full" 
              src="https://placehold.co/55x55" // Placeholder avatar
              alt="Admin" 
            />
          </div>
        </header>

        {/* === KONTEN UTAMA (Stats + Konten Lama) === */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Stats Cards Baru */}
          <StatsCards />
          
          {/* Konten Halaman Asli */}
          <OriginalContent />
        </div>
      </div>
    </div>
  );
}