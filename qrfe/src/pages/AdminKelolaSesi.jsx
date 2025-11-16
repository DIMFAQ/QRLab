import React, { useState, useEffect } from 'react';
import api from '../api';
import MeetingForm from '../components/MeetingForm';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

// --- Helper Components ---

// Komponen Modal (Pop-up)
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    // Klik backdrop untuk menutup
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose} 
    >
      <div 
        className="bg-white p-5 rounded-2xl w-[90%] max-w-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Komponen Pill (Label Status)
const StatusPill = ({ active }) => {
  return active ? (
    <div className="w-fit bg-[rgba(107,210,130,0.79)] text-[#1A5728] text-sm font-medium px-3 py-1 rounded-full">
      Aktif
    </div>
  ) : (
    <div className="w-fit bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
      Selesai
    </div>
  );
};

// --- Main Page Component ---

export default function AdminKelolaSesi() {
  const [meetings, setMeetings] = useState([]);
  const [activeQr, setActiveQr] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal States
  const [rekapModal, setRekapModal] = useState({ open: false, data: null });
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // State baru untuk Countdown
  const [countdown, setCountdown] = useState('00:00:00');

  // --- Countdown Timer Logic ---
  useEffect(() => {
    if (!qrModalOpen || !activeQr?.expires_at) {
      return; 
    }

    const calculateCountdown = () => {
      const expirationTime = new Date(activeQr.expires_at).getTime();
      const now = Date.now();
      const difference = expirationTime - now;

      if (difference <= 0) {
        setCountdown('00:00:00');
        setQrModalOpen(false);
        fetchMeetings(); 
        return;
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const format = (val) => val.toString().padStart(2, '0');
      setCountdown(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
    };
    calculateCountdown();
    const timerId = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timerId);
  }, [qrModalOpen, activeQr]); 


  // --- Data Fetching & Handlers ---

  const extractErrorMessage = (err) => {
    try {
      if (err.response) return `HTTP ${err.response.status} — ${err.response.data?.message || JSON.stringify(err.response.data)}`;
      if (err.request) return 'No response received from server (network/CORS/backend down).';
      return err.message || String(err);
    } catch (e) { return String(err); }
  };

  const fetchMeetings = async () => {
    // Set loading hanya jika meetings kosong (beban awal)
    if (meetings.length === 0) {
        setLoading(true);
    }
    setError('');
    try {
      const { data } = await api.get('/admin/meetings');
      if (!Array.isArray(data)) {
        setError('Format data tidak sesuai: server mengembalikan bukan array.');
        setMeetings([]);
        setLoading(false);
        return;
      }
      setMeetings(data);
      const opened = data.find((m) => m.is_open);
      if (opened) {
        await fetchActiveQr(opened.id, false); // false = jangan buka modal
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

  const fetchActiveQr = async (meetingId, openModal = true) => {
    try {
      const { data } = await api.get(`/admin/meetings/${meetingId}/active-qr`);
      setActiveQr(data);
      if (openModal) {
        setQrModalOpen(true); 
      }
    } catch (err) {
      setActiveQr(null);
      if (openModal) {
        alert('Gagal memuat QR Code. Sesi ini mungkin sudah ditutup.');
        fetchMeetings(); // Refresh list
      }
    }
  };

  // --- Modal-wrapped Handlers ---

  const handleMeetingCreated = async (payload) => {
    setActiveQr(payload);
    setFormModalOpen(false); 
    setQrModalOpen(true);    // Buka modal QR baru
    await fetchMeetings(); // Refresh list (await memastikan meetings ter-update)
  };

  const handleCloseMeeting = async (meetingId) => {
    if (!window.confirm('Tutup sesi presensi ini?')) return;
    try {
      await api.post(`/admin/meetings/${meetingId}/close`);
      await fetchMeetings();
      setActiveQr(null);
      setQrModalOpen(false); // Tutup modal QR
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

  const handleShowQr = (meetingId) => {
    fetchActiveQr(meetingId, true);
  };

  // --- FITUR BARU: Buka Ulang Sesi ---
  const handleReopenMeeting = async (meetingId) => {
    if (!window.confirm('Buka ulang sesi ini? QR baru akan dibuat untuk 5 menit.')) return;
    try {
      // **PERHATIAN**: Endpoint ini '/reopen' harus Anda buat di backend (routes/api.php dan AdminController)
      const { data } = await api.post(`/admin/meetings/${meetingId}/reopen`);
      
      setActiveQr(data);
      setQrModalOpen(true); // Buka modal QR
      await fetchMeetings(); // Refresh list
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError('Gagal membuka ulang sesi: ' + msg);
    }
  };


  // --- Effects ---
  useEffect(() => {
    fetchMeetings();
    // Tambahkan kembali polling (refresh otomatis)
    const interval = setInterval(fetchMeetings, 30000); 
    return () => clearInterval(interval);
  }, []);

  // --- Render ---
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Title Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-black font-['Arimo'] font-bold">Daftar Sesi Praktikum</h2>
        <button
          onClick={() => setFormModalOpen(true)}
          className="bg-[#076BB2] text-white font-['Arimo'] font-bold text-lg px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          + Buat Sesi Baru
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* 2. Content Box (Tabel) */}
      <div className="bg-white rounded-xl shadow-lg">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-200">
          <div className="text-[#717182] text-sm font-['Arimo'] font-bold">MATA KULIAH</div>
          <div className="text-[#717182] text-sm font-['Arimo'] font-bold">JUDUL KE-</div>
          <div className="text-[#717182] text-sm font-['Arimo'] font-bold">WAKTU DIBUAT</div>
          <div className="text-[#717182] text-sm font-['Arimo'] font-bold">STATUS</div>
          <div className="text-[#717182] text-sm font-['Arimo'] font-bold">AKSI</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {loading && meetings.length === 0 && <div className="p-6 text-center text-gray-500">Memuat data...</div>}
          
          {!loading && meetings.length === 0 && (
            <div className="p-6 text-center text-gray-500 italic">Belum ada sesi praktikum.</div>
          )}

          {!loading && meetings.map((m) => (
            <div key={m.id} className="grid grid-cols-5 gap-4 px-6 py-4 items-center">
              <div className="text-black font-medium">{m.name}</div>
              <div className="text-black">{m.meeting_number}</div>
              <div className="text-black text-sm">{new Date(m.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB</div>
              <div><StatusPill active={m.is_open} /></div>
              
              {/* --- Perubahan Aksi --- */}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {m.is_open ? (
                  <button onClick={() => handleShowQr(m.id)} className="text-[#193CB8] font-medium hover:underline">
                    Tampilkan QR
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleShowRekap(m.id)} className="text-[#193CB8] font-medium hover:underline">
                      Lihat Rekap
                    </button>
                    {/* --- Tombol Buka Ulang --- */}
                    <button onClick={() => handleReopenMeeting(m.id)} className="text-green-600 font-medium hover:underline">
                      Buka Ulang
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Modals */}

      {/* Modal Form Buat Sesi Baru */}
      <Modal show={formModalOpen} onClose={() => setFormModalOpen(false)} title="Buat Sesi Praktikum Baru">
        <MeetingForm onMeetingCreated={handleMeetingCreated} activeQr={null} />
      </Modal>

      {/* --- MODAL QR (MERAH) --- */}
      {qrModalOpen && activeQr && (
        // Backdrop (klik untuk menutup)
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setQrModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col relative"
            style={{ height: '810px' }} 
            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal
          >
            {/* --- Tombol Close (X) BARU --- */}
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10"
              style={{ fontSize: '2.5rem', lineHeight: '1' }}
              aria-label="Tutup modal"
            >
              &times;
            </button>
            
            {/* Konten Modal */}
            <div className="flex-grow flex flex-col items-center justify-center pt-10">
              <h2 className="text-4xl font-['Arimo'] font-bold text-center text-slate-800 px-6">
                {/* --- PERBAIKAN LINTER DI SINI --- */}
                {(meetings || []).find(m => m.id === activeQr.meeting_id)?.name || 'Memuat...'}
              </h2>
              <p className="text-xl text-[#717171] font-['Arimo'] mt-4">
                Silahkan scan kode dibawah ini!
              </p>
              
              <div className="my-8 p-4 border border-black">
                <QRCode value={activeQr.qr_token} size={340} level="H" />
              </div>
            </div>

            {/* Tombol Timer / Tutup Sesi */}
            <button
              onClick={() => handleCloseMeeting(activeQr.meeting_id)}
              className="w-full h-[66px] bg-[#CB0B0B] text-white text-4xl font-['Arimo'] font-bold flex items-center justify-center hover:bg-red-800 transition-colors"
            >
              {countdown}
            </button>
          </div>
        </div>
      )}

      {/* Modal Rekap (Logika lama Anda) */}
      {rekapModal.open && (
        <Modal show={rekapModal.open} onClose={closeRekap} title="Rekap Presensi">
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
        </Modal>
      )}
    </div>
  );
}