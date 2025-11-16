// Isi untuk: qrfe/src/pages/AdminKelolaMahasiswa.jsx

import React, { useEffect, useState } from "react";
import api from "../api";
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import ikon

export default function AdminKelolaMahasiswa() {
  // State dan logic Anda dipertahankan
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State baru untuk search (sesuai image 8.png)
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      // Modifikasi API call untuk mengirim parameter search
      const res = await api.get(`/admin/mahasiswa?search=${searchTerm}`);
      setStudents(res.data || []);
    } catch (e) {
      console.error(e);
      setStudents([]);
    }
    setLoading(false);
  };

  // useEffect akan dijalankan ulang saat searchTerm berubah
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      load();
    }, 300); // Debounce 300ms untuk tidak hit API setiap ketikan
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const remove = async (id) => {
    if (!window.confirm("Anda yakin ingin menghapus mahasiswa ini?")) return;
    try {
      await api.delete(`/admin/mahasiswa/${id}`);
      load(); // Muat ulang data setelah hapus
    } catch (e) {
      alert("Gagal menghapus mahasiswa: " + (e.response?.data?.message || e.message));
    }
  };
  
  // Placeholder untuk tombol Tambah & Edit (sesuai gambar)
  const handleTambah = () => {
    alert("Fitur 'Tambah Mahasiswa' belum diimplementasikan.");
  };
  
  const handleEdit = (id) => {
    alert(`Fitur 'Edit Mahasiswa ${id}' belum diimplementasikan.`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold mb-6">Kelola Mahasiswa</h1>

      {/* Kontrol Atas (Search dan Tombol Tambah) - Sesuai image 8.png */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Cari mahasiswa (NPM atau Nama)..."
          className="border px-4 py-2 rounded-lg shadow-sm w-full max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleTambah}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Tambah Mahasiswa
        </button>
      </div>

      {/* Container Tabel */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? <div className="p-6">Memuat...</div> : (
          students.length === 0 ? <div className="p-6 text-slate-500">Belum ada data mahasiswa.</div> : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NPM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{s.npm}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{s.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{s.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex space-x-3">
                      <button
                        onClick={() => handleEdit(s.id)}
                        className="text-yellow-500 hover:text-yellow-700"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => remove(s.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Hapus"
                      >
                        <FaTrash />
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