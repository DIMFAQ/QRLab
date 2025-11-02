import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AttendanceHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/praktikan/riwayat'); // backend kamu
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="rounded-xl bg-white p-4 shadow ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Riwayat Presensi</h3>
        <button onClick={load} className="text-sm font-medium text-blue-600 hover:underline">
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500 italic">Belum ada data.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {items.map((r, i) => (
            <li key={i} className="py-2 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-slate-800">
                  {r.meeting_name || `Pertemuan ${r.meeting_number ?? '-'}`}
                </p>
                <p className="text-slate-500">
                  {r.checked_at ? new Date(r.checked_at).toLocaleString() : '-'}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full ${
                r.status === 'Hadir' ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'}`}>
                {r.status ?? '-'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
