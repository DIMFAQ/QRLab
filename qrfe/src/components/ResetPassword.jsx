import React, { useState } from 'react';
import api from '../api';
import { useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const [form, setForm] = useState({ email, password: '', password_confirmation: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const { data } = await api.post('/reset-password', { ...form, token });
      setMsg(data.message || 'Password berhasil direset. Silakan login.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Gagal reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow ring-1 ring-slate-200">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Reset Password</h2>
      <form onSubmit={submit} className="grid gap-3">
        <input type="email" value={form.email} onChange={e=>setForm(s=>({...s, email:e.target.value}))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
        <input type="password" value={form.password} onChange={e=>setForm(s=>({...s, password:e.target.value}))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Password baru" required />
        <input type="password" value={form.password_confirmation} onChange={e=>setForm(s=>({...s, password_confirmation:e.target.value}))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ulangi password baru" required />
        <button disabled={loading}
          className="mt-2 w-full rounded-xl bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700">
          {loading ? 'Memproses…' : 'Reset Password'}
        </button>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </div>
  );
}
