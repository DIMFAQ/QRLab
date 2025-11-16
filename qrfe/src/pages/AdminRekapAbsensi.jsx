import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminRekapAbsensi() {
  const [rekap, setRekap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/rekap");
        setRekap(res.data || []);
      } catch (e) {
        console.error(e);
        setRekap([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-semibold">Rekap Kehadiran</h3>
        <p className="text-sm text-slate-500">Daftar rekap per pertemuan / mata kuliah.</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        {loading ? <div>Memuat...</div> : (
          rekap.length === 0 ? <div className="text-slate-500">Belum ada data rekap.</div> : (
            <div className="space-y-2">
              {rekap.map((r) => (
                <div key={r.meeting_id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{r.meeting_name} — Pert. {r.meeting_number}</div>
                    <div className="text-xs text-slate-500">{r.date}</div>
                  </div>
                  <div className="text-sm text-slate-600">Hadir: {r.attended}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
