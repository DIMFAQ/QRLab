import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminKelolaSesi() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/classes");
      setClasses(res.data || []);
    } catch (e) {
      console.error("Load kelas error:", e);
      setClasses([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startMeeting = async (id) => {
    try {
      await api.post(`/admin/classes/${id}/open`);
      load();
    } catch (e) {
      alert("Gagal membuka sesi");
    }
  };

  return (
    <div className="space-y-4">

      {loading ? <div>Memuat...</div> : (

        classes.length === 0
        ? <div className="text-slate-500">Belum ada kelas.</div>
        : <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {classes.map(cls => (
            <div key={cls.id} className="bg-white border rounded-lg shadow-sm p-5">

              {/* Header */}
              <div className="flex justify-between">
                <span className="bg-blue-50 text-blue-600 px-2 py-1 text-xs rounded">{cls.kode}</span>
                <span className="text-xs text-gray-400">{cls.hari}</span>
              </div>

              {/* Title */}
              <div className="mt-3 text-lg font-semibold">{cls.name}</div>

              {/* Info */}
              <div className="mt-2 text-sm text-gray-500">{cls.jam}</div>
              <div className="text-sm text-gray-500">{cls.ruangan}</div>

              {/* Stats */}
              <div className="flex justify-between mt-4 text-sm">
                <div>
                  <div className="text-gray-400">Total Pertemuan</div>
                  <div className="font-bold">{cls.total_pertemuan}</div>
                </div>

                <div>
                  <div className="text-gray-400">Kehadiran Rata-rata</div>
                  <div className="font-bold">{cls.kehadiran_rata2}%</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => startMeeting(cls.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Mulai Pertemuan
                </button>

                <a
                  href={`/admin/rekap?meeting=${cls.id}`}
                  className="flex-1 border px-4 py-2 rounded-lg text-center"
                >
                  Rekap
                </a>
              </div>

            </div>
          ))}

        </div>

      )}

    </div>
  );
}
