import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import api from "../api";
import MeetingForm from "../components/MeetingForm";

export default function AdminKelolaSesi() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingId, setStartingId] = useState(null);
  const [closingId, setClosingId] = useState(null);
  const [reopeningId, setReopeningId] = useState(null);
  const [activeQr, setActiveQr] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchActiveQr = async (meetingId) => {
    try {
      const { data } = await api.get(`/admin/meetings/${meetingId}/active-qr`);
      setActiveQr(data);
    } catch {
      setActiveQr(null);
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
      setMeetings(data);

      const openSession = data.find((session) => session.is_open);
      if (openSession) {
        await fetchActiveQr(openSession.id);
      } else {
        setActiveQr(null);
      }
    } catch (e) {
      console.error("Error loading meetings:", e);
      setMeetings([]);
      setActiveQr(null);
      setError(e.response?.data?.message || e.message || "Gagal memuat data sesi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
      const date = new Date(meeting.date);
      if (!Number.isNaN(date.getTime())) {
        const formattedDate = date.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
        return `${formattedDate}${start ? `, ${start}` : ""}${end ? ` - ${end}` : ""}`;
      }
    }

    return start || end ? `${start ?? ""}${end ? ` - ${end}` : ""}`.trim() : "Jadwal belum ditentukan";
  };

  const roomLabel = (meeting) => meeting.room || meeting.ruangan || meeting.location || "Lokasi menyusul";

  const parseAverage = (value) => {
    if (typeof value === "number") return value;
    const numeric = parseFloat(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const sessionStats = useMemo(() => {
    const totalMeetings = meetings.length;
    const activeSessions = meetings.filter((m) => m.is_open).length;
    const averageAttendance = meetings.length
      ? Math.round(
          meetings.reduce((total, item) => total + parseAverage(item.average_attendance), 0) /
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
        value: activeSessions,
        description: "Sesi dengan QR aktif",
        accent: "text-forestgreen",
      },
      {
        label: "Rata-rata Kehadiran",
        value: `${Number.isNaN(averageAttendance) ? 0 : averageAttendance}%`,
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
  }, [meetings]);

  const activeMeeting = useMemo(() => {
    if (!activeQr) return meetings.find((m) => m.is_open) || null;
    return meetings.find((m) => m.id === activeQr.meeting_id) || null;
  }, [activeQr, meetings]);

  const isEmpty = !loading && meetings.length === 0;

  return (
    <div className="space-y-10 font-arimo text-slate-900">
      <section className="rounded-3xl bg-white/95 p-6 shadow-card ring-1 ring-slate-100">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Kelola Sesi Praktikum</p>
            <h1 className="text-3xl font-bold text-steelblue-200 mt-1">Daftar Sesi Praktikum</h1>
            <p className="mt-3 text-sm text-slate-500 max-w-2xl">
              Pantau dan kelola seluruh sesi praktikum, mulai dari membuka QR presensi, memantau kehadiran,
              hingga melihat rekap lengkap setiap kelas.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
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

      {activeQr && activeMeeting && (
        <section className="rounded-3xl bg-gradient-to-br from-steelblue-100/10 via-white to-slate-50 p-6 shadow-card ring-1 ring-steelblue-100/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-steelblue-100">QR Presensi Sedang Aktif</p>
              <h2 className="text-2xl font-semibold text-slate-900 mt-1">{activeMeeting.name}</h2>
              <p className="text-sm text-slate-500 mt-2">Pertemuan ke-{activeMeeting.meeting_number || "?"}</p>
              <p className="text-sm text-slate-500">{scheduleLabel(activeMeeting)}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-white/70 px-3 py-1 font-semibold text-steelblue-100">QR {activeQr.qr_token}</span>
                <span className="rounded-full bg-white/70 px-3 py-1">
                  Berakhir pada {new Date(activeQr.expires_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => closeMeeting(activeMeeting.id)}
                className="mt-6 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-red-700"
              >
                {closingId === activeMeeting.id ? "Menutup..." : "Tutup Sesi"}
              </button>
            </div>

            <div className="flex items-center justify-center rounded-3xl bg-white/90 p-4 shadow-inner">
              <QRCode value={activeQr.qr_token} size={192} level="M" includeMargin />
            </div>
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
                        {(() => {
                          const avg = parseAverage(meeting.average_attendance);
                          return Number.isFinite(avg) ? `${avg}%` : "-";
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Kode</p>
                      <p className="text-lg font-semibold text-orangered">
                        {meeting.code || meeting.kode || `#${meeting.id}`}
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
                        className="rounded-2xl bg-steelblue-100 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-steelblue-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {meeting.is_open
                          ? "Sesi Sedang Aktif"
                          : startingId === meeting.id
                          ? "Menyiapkan QR..."
                          : "Mulai Sesi & Tampilkan QR"}
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
            <MeetingForm onMeetingCreated={handleMeetingCreated} activeQr={activeQr} />
          </div>
        </div>
      )}
    </div>
  );
}
