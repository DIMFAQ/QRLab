import React, { useState } from 'react';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({
    email: '', name: '', student_id: '',
    password: '', password_confirmation: '',
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm(s => ({...s, [e.target.name]: e.target.value}));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const { data } = await api.post('/register', form);
      setMsg(data.message || 'Registrasi berhasil. Cek email untuk verifikasi.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Gagal registrasi.');
    } finally {
      setLoading(false);
    }
  };

  const input = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow ring-1 ring-slate-200">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Daftar Akun</h2>
      <form onSubmit={onSubmit} className="grid gap-3">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input name="email" type="email" value={form.email} onChange={onChange} className={input} required />
        </div>
        <div>
          <label className="text-sm font-medium">Nama Lengkap</label>
          <input name="name" value={form.name} onChange={onChange} className={input} required />
        </div>
        <div>
          <label className="text-sm font-medium">NPM / NIM</label>
          <input name="student_id" value={form.student_id} onChange={onChange} className={input} required />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input name="password" type="password" value={form.password} onChange={onChange} className={input} required />
        </div>
        <div>
          <label className="text-sm font-medium">Konfirmasi Password</label>
          <input name="password_confirmation" type="password" value={form.password_confirmation} onChange={onChange} className={input} required />
        </div>

        <button disabled={loading}
          className="mt-2 w-full rounded-xl bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700">
          {loading ? 'Mendaftar…' : 'Daftar'}
        </button>

        {msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </div>
  );
}
