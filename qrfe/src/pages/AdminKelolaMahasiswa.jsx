import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminKelolaMahasiswa() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/mahasiswa");
      setStudents(res.data || []);
    } catch (e) {
      console.error(e);
      setStudents([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Hapus mahasiswa ini?")) return;
    try {
      await api.delete(`/admin/mahasiswa/${id}`);
      load();
    } catch (e) {
      alert("Gagal hapus");
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-semibold">Data Mahasiswa</h3>
      </div>

      <div className="bg-white p-4 rounded shadow">
        {loading ? <div>Memuat...</div> : (
          students.length === 0 ? <div className="text-slate-500">Belum ada mahasiswa.</div> : (
            <table className="w-full table-auto text-sm">
              <thead className="text-left text-slate-600">
                <tr><th className="p-2">NPM</th><th className="p-2">Nama</th><th className="p-2">Email</th><th className="p-2">Aksi</th></tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2">{s.npm}</td>
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2">
                      <button onClick={()=>remove(s.id)} className="text-red-600 text-sm">Hapus</button>
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
