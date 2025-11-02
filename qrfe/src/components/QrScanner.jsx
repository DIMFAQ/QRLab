import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../api';

export default function QrScannerComponent() {
  const [status, setStatus] = useState({ type: 'info', msg: 'Arahkan ke QR admin.' });
  const [busy, setBusy] = useState(false);

  const handleDecode = async (text) => {
    if (!text || busy) return;
    setBusy(true);
    setStatus({ type: 'info', msg: 'Memvalidasi token…' });

    try {
      const { data } = await api.post('/attendance/checkin-qr', { qr_token: text });
      setStatus({ type: 'success', msg: data.message || 'Check-in berhasil.' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in gagal.';
      setStatus({ type: 'error', msg });
    } finally {
      // beri jeda 2 dtk biar tidak spam decode berulang
      setTimeout(() => setBusy(false), 2000);
    }
  };

  const handleError = (error) => {
    console.error(error);
    setStatus({ type: 'error', msg: 'Gagal mengakses kamera / decode. Cek izin & coba lagi.' });
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold text-blue-700 text-center mb-3">Scan QR Presensi</h2>

      <div className="rounded-xl overflow-hidden border border-slate-200">
        <Scanner
          onScan={handleDecode}
          onError={handleError}
          constraints={{
            audio: false,
            video: {
              facingMode: { ideal: 'environment' }, // kamera belakang di HP
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          }}
          styles={{
            container: { width: '100%' },
            video: { width: '100%', height: '340px', objectFit: 'cover' },
          }}
          components={{
            finder: false, // biar ringan
          }}
        />
      </div>

      <p className="text-center text-xs text-slate-500 mt-2">
        Tips: perbesar QR di layar, hindari glare, jarak ±15–25 cm.
      </p>

      <div className={`mt-3 rounded-lg p-3 text-sm ${
        status.type === 'success'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : status.type === 'error'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-slate-50 text-slate-700 border border-slate-200'
      }`}>
        {status.msg}
      </div>

      {/* Fallback input manual token (buat jaga2) */}
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-slate-600">Masukkan token manual (darurat)</summary>
        <ManualToken onDone={(msg)=>setStatus({type:'success', msg})}/>
      </details>
    </div>
  );
}

function ManualToken({ onDone }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!token.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/attendance/checkin-qr', { qr_token: token.trim() });
      onDone?.(data.message || 'Check-in berhasil.');
    } catch (e) { alert(e.response?.data?.message || 'Gagal.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="mt-2 flex gap-2">
      <input className="flex-1 border rounded-lg px-3 py-2 text-sm"
             placeholder="Tempel token QR di sini"
             value={token} onChange={e=>setToken(e.target.value)} />
      <button onClick={submit} disabled={loading}
        className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">
        Kirim
      </button>
    </div>
  );
}
