import React, { useState, useEffect } from 'react';
import api from '../api';
// 1. Impor komponen verifikasi yang sudah ada
import AdminUserVerification from '../components/AdminUserVerification';

// --- Komponen Modal (Pop-up) ---
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-2xl w-[90%] max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// --- Komponen Form Tambah Mahasiswa ---
const AddStudentForm = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [npm, setNpm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Panggil endpoint BARU (lihat bagian Backend)
      await api.post('/admin/users', {
        name,
        npm,
        email,
        password,
      });
      alert('Mahasiswa berhasil ditambahkan!');
      onSuccess(); // Panggil fungsi onSuccess untuk refresh data
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(`Gagal menambahkan: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mt-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">NPM</label>
        <input
          type="text"
          value={npm}
          onChange={(e) => setNpm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mt-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mt-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mt-1"
          required
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
          Batal
        </button>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
};


// --- Halaman Utama Kelola Mahasiswa ---
export default function AdminKelolaMahasiswa() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Panggil endpoint BARU (lihat bagian Backend)
      const { data } = await api.get('/admin/users');
      setStudents(data);
    } catch (e) {
      setError('Gagal memuat daftar mahasiswa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSuccessAdd = () => {
    setModalOpen(false);
    fetchStudents(); // Refresh tabel setelah berhasil
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Fitur Verifikasi Mahasiswa (Komponen yg sudah ada) */}
      <AdminUserVerification onUserApproved={fetchStudents} />

      {/* 2. Daftar Mahasiswa */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-['Arimo'] font-bold">Daftar Mahasiswa Terverifikasi</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#076BB2] text-white font-bold px-4 py-2 rounded-lg"
          >
            + Tambah Mahasiswa
          </button>
        </div>

        {error && <p className="text-red-500 text-center my-4">{error}</p>}

        {/* Tabel Daftar Mahasiswa */}
        <div className="divide-y divide-gray-200">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50">
            <div className="text-[#717182] text-sm font-bold">NPM</div>
            <div className="text-[#717182] text-sm font-bold">NAMA</div>
            <div className="text-[#717182] text-sm font-bold">EMAIL</div>
            <div className="text-[#717182] text-sm font-bold">AKSI</div>
          </div>

          {/* Body */}
          {loading && <div className="p-4 text-center">Memuat data...</div>}
          {!loading && students.length === 0 && (
            <div className="p-4 text-center text-gray-500">Belum ada mahasiswa terverifikasi.</div>
          )}
          {!loading && students.map((student) => (
            <div key={student.id} className="grid grid-cols-4 gap-4 px-4 py-4 items-center">
              <div className="text-black font-medium">{student.member?.npm || 'N/A'}</div>
              <div className="text-black">{student.member?.name || student.name}</div>
              <div className="text-black text-sm">{student.email}</div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:underline text-sm">Edit</button>
                <button className="text-red-600 hover:underline text-sm">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tambah Mahasiswa */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Mahasiswa Baru">
        <AddStudentForm
          onSuccess={handleSuccessAdd}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}