import React, { useState } from 'react';
import api from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const { data } = await api.post('/forgot-password', { email });
      setMsg(data.message || 'Cek email untuk tautan reset.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Gagal mengirim tautan reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow ring-1 ring-slate-200">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Lupa Password</h2>
      <form onSubmit={submit} className="grid gap-3">
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="you@example.com" required />
        <button disabled={loading}
          className="mt-2 w-full rounded-xl bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700">
          {loading ? 'Mengirim…' : 'Kirim Tautan Reset'}
        </button>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </div>
  );
}
