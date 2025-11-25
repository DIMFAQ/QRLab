import React, { useEffect, useState } from "react";
import api from "../api";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function AdminKelolaMahasiswa() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all"); // all | active | pending
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_id: "",
    name: "",
    email: "",
    password: "",
    status: "pending"
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const timestamp = `&_t=${new Date().getTime()}`;
      const q = `?search=${encodeURIComponent(searchTerm || "")}&status=${encodeURIComponent(status || "all")}${timestamp}`;
      const res = await api.get(`/admin/users${q}`);
      setStudents(res.data || []);
    } catch (e) {
      console.error(e);
      setStudents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, status]);

  const remove = async (id) => {
    if (!window.confirm("Anda yakin ingin menghapus mahasiswa ini?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      load();
    } catch (e) {
      alert("Gagal menghapus mahasiswa: " + (e.response?.data?.message || e.message));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setErrorMsg("");
  };

  const openAdd = () => {
    setErrorMsg("");
    setEditingId(null);
    setForm({
      student_id: "",
      name: "",
      email: "",
      password: "",
      status: "pending"
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setErrorMsg("");
    setForm({
      student_id: item.student_id || "",
      name: item.name || "",
      email: item.email || "",
      password: "",
      status: item.status === "active" ? "active" : "pending",
    });
    setShowModal(true);
  };

  const handleChange = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.student_id || !form.name || !form.email) {
      setErrorMsg("Student ID, Nama, dan Email wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        student_id: form.student_id,
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        status: form.status
      };

      if (editingId) {
        await api.put(`/admin/users/${editingId}`, payload);
      } else {
        await api.post("/admin/users", payload);
      }

      await load();
      closeModal();
      setSearchTerm(""); 
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join(" \n");
        setErrorMsg(errorMessages);
      } else {
        setErrorMsg(err.response?.data?.message || err.message || "Terjadi kesalahan");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 px-4 py-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
            <button
              onClick={() => setStatus("all")}
              className={`px-5 py-2 font-semibold transition ${
                status === "all"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatus("active")}
              className={`px-5 py-2 font-semibold transition ${
                status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setStatus("pending")}
              className={`px-5 py-2 font-semibold transition ${
                status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              Menunggu Verif
            </button>
          </div>
          <input
            type="text"
            placeholder="Cari mahasiswa (ID/Nama/Email)..."
            className="ml-3 border border-gray-300 bg-white placeholder-gray-400 px-4 py-2.5 rounded-lg shadow-sm text-base w-full max-w-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            spellCheck={false}
          />
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg hover:bg-blue-700 font-bold tracking-wide transition"
        >
          + Tambah Mahasiswa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-auto">
        {loading ? (
          <div className="p-8 text-center text-lg text-gray-400 font-medium">Memuat...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Belum ada data mahasiswa.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4 align-top font-mono whitespace-nowrap">{s.student_id}</td>
                  <td className="px-6 py-4 align-top font-semibold text-slate-800 max-w-xs break-words">{s.name}</td>
                  <td className="px-6 py-4 align-top text-slate-700 max-w-xs break-all">{s.email}</td>
                  <td className="px-6 py-4 align-top">
                    <span className={`px-3 py-1 inline-block text-xs font-semibold rounded-xl shadow-sm ${
                      s.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : s.status === "pending" 
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-slate-100 text-slate-800"
                    }`}>
                      {s.status === "active" ? "Aktif" : s.status === "pending" ? "Menunggu" : s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 hover:text-yellow-700"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => remove(s.id)}
                        className="p-2 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700"
                        title="Hapus"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1.5px]" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
            <form onSubmit={submitForm} className="p-8 space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold">{editingId ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</h2>
              {errorMsg && <div className="text-sm text-red-600 whitespace-pre-line">{errorMsg}</div>}
              <div>
                <label className="block text-sm font-medium mb-1">Student ID</label>
                <input
                  type="text"
                  value={form.student_id}
                  onChange={(e) => handleChange("student_id", e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password (opsional)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  placeholder={editingId ? "Isi untuk ganti password" : ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                >
                  <option value="pending">Menunggu Verifikasi</option>
                  <option value="active">Aktif</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-60 transition"
                >
                  {saving ? "Menyimpan..." : (editingId ? "Update" : "Simpan")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}