// Isi untuk: qrfe/src/pages/AdminRekapAbsensi.jsx

import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminRekapAbsensi() {
  // State dan logic Anda dipertahankan
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

  const handleLihatDetail = (id) => {
    alert(`Fitur 'Lihat Detail Rekap ${id}' belum diimplementasikan.`);
    // Anda bisa navigasi ke halaman detail rekap di sini
    // navigate(`/admin/rekap-absensi/${id}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold mb-6">Rekap Absensi</h1>

      {/* TODO: Tambahkan filter di sini sesuai image 9.png jika diperlukan */}
      {/* <div className="bg-white p-4 rounded-lg shadow-md flex space-x-4">
        ... filter ...
      </div> */}

      {/* Container Tabel (Sesuai image 9.png) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? <div className="p-6">Memuat...</div> : (
          rekap.length === 0 ? <div className="p-6 text-slate-500">Belum ada data rekap.</div> : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Sesi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertemuan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Hadir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rekap.map((r) => (
                  <tr key={r.meeting_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{r.meeting_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{r.meeting_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{r.attended}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleLihatDetail(r.meeting_id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}