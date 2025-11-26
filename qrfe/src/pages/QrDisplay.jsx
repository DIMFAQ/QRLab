import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import api from "../api";

export default function QrDisplay() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenQr, setFullscreenQr] = useState(null);
  const navigate = useNavigate();

  // Helper: Convert UTC to Jakarta timezone (UTC+7)
  const toJakartaTime = (utcDateString) => {
    if (!utcDateString) return null;
    const date = new Date(utcDateString);
    if (Number.isNaN(date.getTime())) return null;
    // Add timezone offset untuk Jakarta (UTC+7 = 420 minutes)
    return new Date(date.getTime() + (7 * 60 * 60 * 1000));
  };

  useEffect(() => {
    loadActiveSessions();
    // Auto refresh setiap 30 detik
    const interval = setInterval(loadActiveSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  // ESC key to close fullscreen
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && fullscreenQr) {
        setFullscreenQr(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [fullscreenQr]);

  const loadActiveSessions = async () => {
    try {
      const res = await api.get("/admin/meetings");
      const data = Array.isArray(res.data) ? res.data : [];
      
      // Filter hanya yang open dan ambil QR token
      const openMeetings = data.filter((m) => m.is_open);
      
      // Fetch QR token untuk setiap meeting yang open
      const sessionsWithQr = await Promise.all(
        openMeetings.map(async (meeting) => {
          try {
            const { data: qrData } = await api.get(`/admin/meetings/${meeting.id}/active-qr`);
            return { ...meeting, qrData };
          } catch {
            return { ...meeting, qrData: null };
          }
        })
      );
      
      setActiveSessions(sessionsWithQr.filter(s => s.qrData));
      setLoading(false);
    } catch (error) {
      console.error("Error loading active sessions:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="text-2xl text-gray-600">Memuat sesi aktif...</div>
      </div>
    );
  }

  if (activeSessions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center max-w-2xl">
          <div className="text-6xl mb-6">📭</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tidak Ada Sesi Aktif</h2>
          <p className="text-gray-600 mb-8 text-lg">Belum ada sesi presensi yang dibuka saat ini</p>
          <button
            onClick={() => navigate("/admin/sesi")}
            className="bg-[#076BB2] hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition text-lg"
          >
            Kembali ke Kelola Sesi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">QR Code Presensi Aktif</h1>
            <p className="text-gray-600 mt-1">{activeSessions.length} sesi sedang berjalan</p>
          </div>
          <button
            onClick={() => navigate("/admin/sesi")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition flex items-center gap-2 border border-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Kembali
          </button>
        </div>

        {/* Grid QR Cards - 2 kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative"
            >
              {/* Fullscreen Button */}
              <button
                onClick={() => setFullscreenQr(session)}
                className="absolute top-3 right-3 bg-[#076BB2] hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-semibold z-10"
                title="Fullscreen QR"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                </svg>
                Fullscreen
              </button>

              {/* Header Card */}
              <div className="text-center mb-6 pt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{session.name}</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-semibold border border-green-200">
                    {session.qrData.qr_token}
                  </span>
                  <span className="text-green-600 font-semibold text-sm">● Aktif</span>
                </div>
                <p className="text-sm text-gray-500">Pertemuan ke-{session.meeting_number}</p>
              </div>

              {/* QR Code - Lebih Besar */}
              <div className="flex justify-center items-center mb-6">
                <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
                  <QRCode 
                    value={session.qrData.qr_token} 
                    size={320}
                    level="H" 
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 text-sm border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Tanggal:</span>
                  <span className="text-gray-800 font-semibold text-right">
                    {(() => {
                      const jakartaDate = toJakartaTime(session.start_time);
                      return jakartaDate ? jakartaDate.toLocaleDateString("id-ID", { 
                        weekday: "short", 
                        day: "numeric", 
                        month: "short", 
                        year: "numeric" 
                      }) : '-';
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Waktu:</span>
                  <span className="text-gray-800 font-semibold">
                    {(() => {
                      const startJakarta = toJakartaTime(session.start_time);
                      const endJakarta = toJakartaTime(session.end_time);
                      const startStr = startJakarta ? startJakarta.toLocaleTimeString("id-ID", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      }) : '-';
                      const endStr = endJakarta ? endJakarta.toLocaleTimeString("id-ID", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      }) : '-';
                      return `${startStr} - ${endStr}`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">QR Berakhir:</span>
                  <span className="text-red-600 font-semibold">
                    {(() => {
                      const jakartaDate = toJakartaTime(session.qrData.expires_at);
                      return jakartaDate ? jakartaDate.toLocaleTimeString("id-ID", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      }) : '-';
                    })()}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{session.attendances_count || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Mahasiswa Hadir</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{session.attendance_percentage || 0}%</div>
                    <div className="text-sm text-gray-600 mt-1">Kehadiran</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 text-center">
          <p className="text-sm text-gray-600">
            ⟳ Halaman ini otomatis refresh setiap 30 detik • Terakhir update: {new Date().toLocaleTimeString("id-ID")}
          </p>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenQr && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={() => setFullscreenQr(null)}
            className="absolute top-6 right-6 bg-white hover:bg-gray-100 rounded-full p-4 shadow-2xl transition z-10 group"
          >
            <svg className="w-8 h-8 text-gray-700 group-hover:text-red-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          {/* Content */}
          <div className="text-center max-w-4xl w-full">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6 shadow-lg">
                <span className="text-5xl">📱</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {fullscreenQr.name}
              </h1>
              <div className="flex items-center justify-center gap-4 mb-3">
                <span className="bg-green-500 text-white px-8 py-3 rounded-full font-bold text-2xl shadow-xl">
                  {fullscreenQr.qrData.qr_token}
                </span>
                <span className="bg-white text-green-600 px-6 py-3 rounded-full font-bold text-xl shadow-xl">
                  Aktif
                </span>
              </div>
              <p className="text-white text-xl font-medium opacity-90">
                Pertemuan ke-{fullscreenQr.meeting_number}
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-3xl p-12 shadow-2xl mb-8 inline-block">
              <QRCode 
                value={fullscreenQr.qrData.qr_token} 
                size={Math.min(window.innerWidth * 0.5, 600)}
                level="H" 
                includeMargin 
              />
              <p className="text-center text-2xl text-gray-700 mt-6 font-bold">
                Scan QR Code untuk Absensi
              </p>
              <p className="text-center text-lg text-gray-500 mt-2">
                Token: {fullscreenQr.qrData.qr_token}
              </p>
            </div>

            {/* Info Footer */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg">
                <div>
                  <p className="text-white/70 mb-1">Tanggal</p>
                  <p className="font-bold">
                    {(() => {
                      const jakartaDate = toJakartaTime(fullscreenQr.start_time);
                      return jakartaDate ? jakartaDate.toLocaleDateString("id-ID", { 
                        day: "numeric", 
                        month: "long", 
                        year: "numeric" 
                      }) : '-';
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 mb-1">Waktu</p>
                  <p className="font-bold">
                    {(() => {
                      const startJakarta = toJakartaTime(fullscreenQr.start_time);
                      const endJakarta = toJakartaTime(fullscreenQr.end_time);
                      const startStr = startJakarta ? startJakarta.toLocaleTimeString("id-ID", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      }) : '-';
                      const endStr = endJakarta ? endJakarta.toLocaleTimeString("id-ID", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      }) : '-';
                      return `${startStr} - ${endStr}`;
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 mb-1">QR Berakhir</p>
                  <p className="font-bold text-yellow-300">
                    {(() => {
                      const jakartaDate = toJakartaTime(fullscreenQr.qrData.expires_at);
                      return jakartaDate ? jakartaDate.toLocaleTimeString("id-ID", { 
                        hour: "2-digit", 
                        minute: "2-digit",
                        second: "2-digit"
                      }) : '-';
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Hint */}
            <p className="text-white/60 mt-6 text-sm">
              Tekan ESC atau klik tombol ✕ untuk keluar dari mode fullscreen
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
