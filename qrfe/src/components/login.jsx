import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const { data } = await api.post('/login', { email, password });
      const token = data.token;
      const user  = data.user ?? data;
      localStorage.setItem('authToken', token);
      onLogin?.(user, token);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Gagal login. Cek email/password.');
    } finally {
      setLoading(false);
    }
  };

  const input = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow ring-1 ring-slate-200">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Masuk</h2>
      <form onSubmit={submit} className="grid gap-3">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" className={input} value={email}
                 onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input type="password" className={input} value={password}
                 onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <button disabled={loading}
                className="mt-2 w-full rounded-xl bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700">
          {loading ? 'Memproses…' : 'Login'}
        </button>
        {msg && <p className="text-sm mt-2 text-red-600">{msg}</p>}
      </form>

      {/* Link register & lupa password */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/register" className="text-blue-600 hover:underline">
          Buat akun baru
        </Link>
        <Link to="/forgot-password" className="text-blue-600 hover:underline">
          Lupa password?
        </Link>
      </div>
    </div>
  );
}