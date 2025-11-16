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
      // Menambahkan timestamp untuk menghindari cache browser
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

      closeModal();
      
      // Reset search. useEffect akan memanggil load()
      setSearchTerm(""); 
      
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join(" \n"); // \n akan berfungsi karena whitespace-pre-line
        setErrorMsg(errorMessages);
      } else {
        setErrorMsg(err.response?.data?.message || err.message || "Terjadi kesalahan");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold mb-6">Kelola Mahasiswa</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex rounded-lg overflow-hidden border">
            <button
              onClick={() => setStatus("all")}
              className={`px-4 py-2 ${status === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatus("active")}
              className={`px-4 py-2 ${status === "active" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
            >
              Aktif
            </button>
            <button
              onClick={() => setStatus("pending")}
              className={`px-4 py-2 ${status === "pending" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
            >
              Menunggu Verifikasi
            </button>
          </div>

          <input
            type="text"
            placeholder="Cari mahasiswa (Student ID atau Nama)..."
            className="border px-4 py-2 rounded-lg shadow-sm w-full max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={openAdd}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            Tambah Mahasiswa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6">Memuat...</div>
        ) : students.length === 0 ? (
          <div className="p-6 text-slate-500">Belum ada data mahasiswa.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{s.student_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{s.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{s.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          s.status === "active" ? "bg-green-100 text-green-800" :
                          s.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {s.status === "active" ? "Aktif" : s.status === "pending" ? "Menunggu" : s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                      <button
                        onClick={() => openEdit(s)}
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
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-10">
            <form onSubmit={submitForm} className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Mahasiswa" : "Tambah Mahasiswa"}
              </h2>

              {/* Menambahkan 'whitespace-pre-line' agar \n berfungsi */}
              {errorMsg && <div className="text-sm text-red-600 whitespace-pre-line">{errorMsg}</div>}

              <div>
                <label className="block text-sm font-medium mb-1">Student ID</label>
                <input
                  type="text"
                  value={form.student_id}
                  onChange={(e) => handleChange("student_id", e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  // [PERBAIKAN] Diubah dari e.g.value menjadi e.target.value
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password (opsional)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder={editingId ? "Isi untuk ganti password" : ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full border px-3 py-2 rounded"
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
                  className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
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