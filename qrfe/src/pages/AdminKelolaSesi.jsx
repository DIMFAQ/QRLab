import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import api from "../api";
import MeetingForm from "../components/MeetingForm";

// Helper function to convert UTC to Jakarta time
const toJakartaTime = (utcDateString) => {
  if (!utcDateString) return null;
  const date = new Date(utcDateString);
  if (Number.isNaN(date.getTime())) return null;
  // Add timezone offset untuk Jakarta (UTC+7 = 420 minutes)
  return new Date(date.getTime() + (7 * 60 * 60 * 1000));
};

export default function AdminKelolaSesi() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingId, setStartingId] = useState(null);
  const [closingId, setClosingId] = useState(null);
  const [reopeningId, setReopeningId] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fullscreenQr, setFullscreenQr] = useState(null);

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

  const fetchActiveQr = async (meetingId) => {
    try {
      const { data } = await api.get(`/admin/meetings/${meetingId}/active-qr`);
      return data;
    } catch {
      return null;
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/meetings");
      console.log("Meetings response:", res.data);
      const data = Array.isArray(res.data) ? res.data : [];
      console.log("Meetings array:", data);
      console.log("First meeting:", data[0]);
      setMeetings(data);

      // Load active sessions dengan QR
      const openMeetings = data.filter((m) => m.is_open);
      const sessionsWithQr = await Promise.all(
        openMeetings.map(async (meeting) => {
          const qrData = await fetchActiveQr(meeting.id);
          return qrData ? { ...meeting, qrData } : null;
        })
      );
      setActiveSessions(sessionsWithQr.filter(s => s !== null));
    } catch (e) {
      console.error("Error loading meetings:", e);
      setMeetings([]);
      setActiveSessions([]);
      setError(e.response?.data?.message || e.message || "Gagal memuat data sesi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    
    // Trigger auto-start dan auto-close pertama kali langsung
    const checkAutoStartClose = async () => {
      try {
        const [startRes, closeRes] = await Promise.all([
          api.post('/admin/meetings/auto-start'),
          api.post('/admin/meetings/auto-close')
        ]);
        
        if (startRes.data.started_count > 0) {
          console.log(`Auto-started ${startRes.data.started_count} meeting(s)`, startRes.data);
          load();
        }
        
        if (closeRes.data.closed_count > 0) {
          console.log(`Auto-closed ${closeRes.data.closed_count} meeting(s)`, closeRes.data);
          load();
        }
      } catch (e) {
        console.error('Auto-start/close check failed:', e);
      }
    };
    
    // Jalankan pertama kali
    checkAutoStartClose();
    
    // Auto-start/close polling setiap 30 detik (lebih responsif)
    const autoInterval = setInterval(checkAutoStartClose, 30000);
    
    // Auto refresh setiap 30 detik
    const refreshInterval = setInterval(load, 30000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(autoInterval);
    };
  }, []);

  const startMeeting = async (meetingId) => {
    if (!window.confirm("Mulai sesi ini dan tampilkan QR?") || startingId) {
      return;
    }

    setStartingId(meetingId);
    try {
      await api.post(`/admin/meetings/${meetingId}/qr`);
      await load();
    } catch (e) {
      alert("Gagal membuka sesi: " + (e.response?.data?.message || e.message));
    } finally {
      setStartingId(null);
    }
  };

  const closeMeeting = async (meetingId) => {
    if (!window.confirm("Tutup sesi presensi ini?") || closingId) {
      return;
    }

    setClosingId(meetingId);
    try {
      await api.post(`/admin/meetings/${meetingId}/close`);
      await load();
    } catch (e) {
      alert("Gagal menutup sesi: " + (e.response?.data?.message || e.message));
    } finally {
      setClosingId(null);
    }
  };

  const reopenMeeting = async (meetingId) => {
    if (!window.confirm("Buka kembali sesi ini untuk mahasiswa yang terlambat?") || reopeningId) {
      return;
    }

    setReopeningId(meetingId);
    try {
      await api.post(`/admin/meetings/${meetingId}/reopen`);
      await load();
    } catch (e) {
      alert("Gagal membuka kembali sesi: " + (e.response?.data?.message || e.message));
    } finally {
      setReopeningId(null);
    }
  };

  const handleMeetingCreated = () => {
    setShowCreateModal(false);
    load();
  };

  const formatTime = (value) => {
    if (!value) return null;
    if (/^\d{2}:\d{2}/.test(value)) return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const scheduleLabel = (meeting) => {
    const day = meeting.day || meeting.hari;
    const start = formatTime(meeting.start_time || meeting.mulai || meeting.start);
    const end = formatTime(meeting.end_time || meeting.selesai || meeting.end);

    if (day && (start || end)) {
      return `${day}${start ? `, ${start}` : ""}${end ? ` - ${end}` : ""}`;
    }

    if (meeting.date) {
      const jakartaDate = toJakartaTime(meeting.date);
      if (jakartaDate) {
        const formattedDate = jakartaDate.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
        return `${formattedDate}${start ? `, ${start}` : ""}${end ? ` - ${end}` : ""}`;
      }
    }

    return start || end ? `${start ?? ""}${end ? ` - ${end}` : ""}`.trim() : "Jadwal belum ditentukan";
  };

  const roomLabel = (meeting) => meeting.room || meeting.ruangan || meeting.location || "";

  const parseAverage = (value) => {
    if (typeof value === "number") return value;
    const numeric = parseFloat(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const sessionStats = useMemo(() => {
    const totalMeetings = meetings.length;
    const activeSessionsCount = activeSessions.length;
    
    // Hitung rata-rata dari attendance_percentage yang dikirim backend
    const averageAttendance = meetings.length
      ? Math.round(
          meetings.reduce((total, item) => total + (item.attendance_percentage ?? 0), 0) /
            meetings.length
        )
      : 0;
    
    const attendanceCount = meetings.reduce((total, item) => total + (item.attendances_count ?? 0), 0);

    return [
      {
        label: "Total Sesi",
        value: totalMeetings,
        description: "Termasuk sesi yang telah selesai",
        accent: "text-steelblue-100",
      },
      {
        label: "Sedang Berjalan",
        value: activeSessionsCount,
        description: "Sesi dengan QR aktif",
        accent: "text-forestgreen",
      },
      {
        label: "Rata-rata Kehadiran",
        value: `${averageAttendance}%`,
        description: "Perhitungan dari seluruh sesi",
        accent: "text-blueviolet",
      },
      {
        label: "Total Presensi",
        value: attendanceCount,
        description: "Mahasiswa tercatat hadir",
        accent: "text-orangered",
      },
    ];
  }, [meetings, activeSessions]);

  const activeMeeting = null; // Tidak dipakai lagi

  const isEmpty = !loading && meetings.length === 0;

  return (
    <div className="space-y-10 font-arimo text-slate-900">
      <section className="rounded-3xl bg-white/95 p-6 shadow-card ring-1 ring-slate-100">
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={load}
            className="rounded-2xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            🔄 Segarkan Data
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 text-base font-bold text-white shadow-xl shadow-blue-500/50 hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl hover:shadow-blue-600/60 transform hover:scale-105 transition-all duration-200"
          >
            ➕ Buat Sesi Baru
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {sessionStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
              <p className={`mt-2 text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* QR Code Display - 2 kolom seperti QrDisplay */}
      {activeSessions.length > 0 && (
        <section className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">QR Code Presensi Aktif</h2>
                <p className="text-gray-600 mt-1">{activeSessions.length} sesi sedang berjalan</p>
              </div>
            </div>
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

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <Link
                    to={`/admin/rekap?meeting=${session.id}`}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-600 hover:border-steelblue-100/60"
                  >
                    📊 Lihat Rekap
                  </Link>
                  <button
                    type="button"
                    onClick={() => closeMeeting(session.id)}
                    disabled={closingId === session.id}
                    className="rounded-2xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:bg-red-700 disabled:opacity-70"
                  >
                    {closingId === session.id ? "Menutup..." : "❌ Tutup Sesi"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl bg-white/95 p-6 shadow-card ring-1 ring-slate-100">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Daftar Sesi</p>
            <h2 className="text-2xl font-semibold text-slate-900">Jadwal Praktikum Aktif</h2>
          </div>
          <p className="text-sm text-slate-500">{meetings.length} sesi terdaftar</p>
        </div>

        {loading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-48 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-slate-500">
            Belum ada sesi terdaftar. Gunakan tombol "Buat Sesi Baru" untuk menjadwalkan praktikum.
          </div>
        )}

        {!loading && meetings.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {meetings.map((meeting) => {
              const statusBadge = meeting.is_open
                ? "bg-forestgreen/10 text-forestgreen"
                : "bg-slate-200 text-slate-600";

              return (
                <article
                  key={meeting.id}
                  className="flex h-full flex-col rounded-3xl border border-gainsboro bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Pertemuan {meeting.meeting_number ?? "-"}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">{meeting.name}</h3>
                      <p className="text-sm text-slate-500">{scheduleLabel(meeting)}</p>
                      <p className="text-sm text-slate-500">{roomLabel(meeting)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}>
                      {meeting.is_open ? "Aktif" : "Ditutup"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Total Hadir</p>
                      <p className="text-lg font-semibold text-steelblue-100">{meeting.attendances_count ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Rata-rata</p>
                      <p className="text-lg font-semibold text-blueviolet">
                        {meeting.attendance_percentage != null ? `${meeting.attendance_percentage}%` : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Enrolled</p>
                      <p className="text-lg font-semibold text-slate-600">
                        {meeting.total_enrolled ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 pt-6">
                    {!meeting.is_open && meeting.attendances_count > 0 ? (
                      <button
                        type="button"
                        onClick={() => reopenMeeting(meeting.id)}
                        disabled={reopeningId === meeting.id}
                        className="rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reopeningId === meeting.id ? "Membuka..." : "🔓 Buka Kembali Sesi (Untuk Terlambat)"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startMeeting(meeting.id)}
                        disabled={startingId === meeting.id || meeting.is_open}
                        className="rounded-2xl px-4 py-2 text-sm font-semibold shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60"
                        style={{
                          backgroundColor: meeting.is_open ? '#6B7280' : '#076BB2',
                          color: '#FFFFFF',
                        }}
                        onMouseEnter={(e) => {
                          if (!meeting.is_open && startingId !== meeting.id) {
                            e.currentTarget.style.backgroundColor = '#065A94';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!meeting.is_open) {
                            e.currentTarget.style.backgroundColor = '#076BB2';
                          }
                        }}
                      >
                        {meeting.is_open
                          ? "✓ Sesi Sedang Aktif"
                          : startingId === meeting.id
                          ? "⏳ Menyiapkan QR..."
                          : "▶ Mulai Sesi & Tampilkan QR"}
                      </button>
                    )}

                    <div className="flex gap-3">
                      <Link
                        to={`/admin/rekap?meeting=${meeting.id}`}
                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-600 hover:border-steelblue-100/60"
                      >
                        📊 Lihat Rekap
                      </Link>
                      {meeting.is_open && (
                        <button
                          type="button"
                          onClick={() => closeMeeting(meeting.id)}
                          disabled={closingId === meeting.id}
                          className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-70"
                        >
                          {closingId === meeting.id ? "Menutup..." : "❌ Tutup"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

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

          {/* QR Content */}
          <div className="text-center max-w-4xl w-full">
            {/* Session Info */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-3">{fullscreenQr.name}</h2>
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-2xl">
                  {fullscreenQr.qrData.qr_token}
                </span>
                <span className="text-green-400 font-semibold text-xl">● Aktif</span>
              </div>
              <p className="text-white text-lg">
                Pertemuan ke-{fullscreenQr.meeting_number} • 
                Berakhir {(() => {
                  const jakartaDate = toJakartaTime(fullscreenQr.qrData.expires_at);
                  return jakartaDate ? jakartaDate.toLocaleTimeString("id-ID", { 
                    hour: "2-digit", 
                    minute: "2-digit" 
                  }) : '-';
                })()}
              </p>
            </div>

            {/* Huge QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl inline-block">
                <QRCode 
                  value={fullscreenQr.qrData.qr_token} 
                  size={Math.min(600, window.innerWidth - 100, window.innerHeight - 300)}
                  level="H" 
                  includeMargin={true}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 flex justify-center gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400">{fullscreenQr.attendances_count || 0}</div>
                <div className="text-white text-lg mt-2">Mahasiswa Hadir</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400">{fullscreenQr.attendance_percentage || 0}%</div>
                <div className="text-white text-lg mt-2">Kehadiran</div>
              </div>
            </div>

            <p className="text-gray-400 mt-8 text-sm">Tekan ESC atau klik tombol ✕ untuk menutup</p>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Buat Sesi Baru</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <MeetingForm onMeetingCreated={handleMeetingCreated} activeQr={null} />
          </div>
        </div>
      )}
    </div>
  );
}
