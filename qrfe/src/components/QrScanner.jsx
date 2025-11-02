import React, { useState, useRef } from 'react';
import api from '../api';

// === Gunakan salah satu scanner ===
// A) react-qr-scanner (punya onScan/onError)
import QrScanner from 'react-qr-scanner';

// (Opsional) B) Kalau nanti ganti ke react-qr-reader, tinggal uncomment ini:
// import { QrReader } from 'react-qr-reader';

export default function QrScannerComponent() {
  const [status, setStatus] = useState({ type: 'idle', message: '' }); // idle|info|success|error
  const [scannedToken, setScannedToken] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const isSubmitting = useRef(false); // anti double submit

  const reset = () => {
    setIsScanning(true);
    setScannedToken('');
    setStatus({ type: 'idle', message: '' });
    isSubmitting.current = false;
  };

  const submitToken = async (token) => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setStatus({ type: 'info', message: 'Memvalidasi token…' });

    try {
      const { data } = await api.post('/attendance/checkin-qr', { qr_token: token });
      setStatus({ type: 'success', message: data?.message ?? 'Presensi berhasil!' });

      // getaran kecil di HP (kalau didukung)
      if (navigator.vibrate) navigator.vibrate(40);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Terjadi kesalahan saat check-in.';
      setStatus({ type: 'error', message: `Absensi gagal: ${msg}` });
      setIsScanning(true);                 // izinkan scan ulang
      isSubmitting.current = false;        // buka throttle
    }
  };

  // === Handler untuk react-qr-scanner ===
  const handleScan = (payload) => {
    if (!payload || !isScanning) return;

    // Library kadang kirim string langsung, kadang { text }
    const token = typeof payload === 'string' ? payload : payload?.text;
    if (!token) return;

    setIsScanning(false);           // stop kamera sementara
    setScannedToken(token);
    submitToken(token);
  };

  const handleError = (e) => {
    console.error(e);
    setStatus({ type: 'error', message: 'Gagal mengakses kamera. Izinkan akses kamera lalu coba lagi.' });
  };

  return (
    <div className="min-h-screen bg-blue-50 text-slate-900 flex flex-col items-center px-4 py-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">Scan QR Presensi</h1>

      <div className="w-full max-w-xs rounded-2xl bg-white shadow-md ring-1 ring-slate-200 overflow-hidden">
        {isScanning ? (
          <div className="aspect-square w-full">
            {/* === A) react-qr-scanner === */}
            <QrScanner
              delay={250}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%', height: '100%' }}
              constraints={{ video: { facingMode: 'environment' } }}
            />

            {/* (Opsional) B) Kalau pakai react-qr-reader:
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={(result, error) => {
                if (result) handleScan(result?.text);
                if (error) handleError(error);
              }}
              videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            */}
          </div>
        ) : (
          <div className="p-5 text-center">
            {status.type === 'info' && <p className="text-slate-600 animate-pulse">Memvalidasi token…</p>}
            {status.type === 'success' && <p className="text-green-700 font-semibold">{status.message}</p>}
            {status.type === 'error' && <p className="text-red-600 font-semibold">{status.message}</p>}

            <button
              onClick={reset}
              className="mt-4 w-full rounded-xl bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 active:scale-[.98] transition"
            >
              Scan Lagi
            </button>

            {scannedToken && (
              <p className="mt-3 text-xs text-slate-500 break-all">
                Token: <span className="font-mono">{scannedToken}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-600 text-center max-w-xs">
        Arahkan kamera ke QR Code dari admin. Pastikan cahaya cukup dan QR tidak buram.
      </p>

      {/* Banner status global */}
      {status.message && (
        <div
          className={
            'fixed bottom-4 left-4 right-4 mx-auto max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow ' +
            (status.type === 'success'
              ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
              : status.type === 'error'
              ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
              : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200')
          }
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
