import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function AdminKelolaSesi() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // === LOAD DATA (Pakai endpoint yang benar) ===
  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/meetings");
      setMeetings(res.data || []);
    } catch (e) {
      console.error("Load meeting error:", e);
      setMeetings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // === MULAI PERSEMUNAN (OPEN SESSION) ===
  const startMeeting = async (meetingId) => {
    try {
      if (!window.confirm("Mulai pertemuan ini?")) return;
      await api.post(`/admin/meetings/${meetingId}/qr`);
      alert("Sesi berhasil dibuka!");
      load();
    } catch (e) {
      alert("Gagal membuka sesi: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold mb-6">Kelola Sesi</h1>

      {/* LOADING */}
      {loading ? (
        <div>Memuat...</div>
      ) : meetings.length === 0 ? (
        <div className="text-slate-500 bg-white p-6 rounded-lg shadow-md">
          Belum ada sesi.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="bg-white border rounded-lg shadow-md p-5 flex flex-col h-full"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 text-xs rounded-full font-medium">
                  {m.code || m.kode || `Pertemuan ${m.meeting_number}`}
                </span>

                <span className="text-sm text-gray-500">
                  {m.date ? new Date(m.date).toLocaleDateString() : ""}
                </span>
              </div>

              {/* Nama Praktikum */}
              <div className="text-xl font-semibold text-gray-800">
                {m.name}
              </div>

              {/* Info */}
              <div className="mt-2 text-sm text-gray-600">
                {m.time || m.jam || "-"}
              </div>

              <div className="text-sm text-gray-600">
                {m.room || m.ruangan || "-"}
              </div>

              <div className="flex-grow"></div>

              {/* Statistik */}
              <div className="flex justify-between mt-5 pt-4 border-t">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase">
                    Total Pertemuan
                  </div>
                  <div className="font-bold text-lg">
                    {m.attendances_count ?? 0}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase">
                    Kehadiran Rata-rata
                  </div>
                  <div className="font-bold text-lg">
                    {m.average_attendance ?? 0}%
                  </div>
                </div>
              </div>

              {/* Tombol */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => startMeeting(m.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
                >
                  Mulai Pertemuan
                </button>

                <Link
                  to={`/admin/rekap?meeting=${m.id}`}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg text-center text-gray-700 hover:bg-gray-50"
                >
                  Rekap
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
