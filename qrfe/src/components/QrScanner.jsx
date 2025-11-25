import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function QrScannerComponent({ onDetected }) {
  const [busy, setBusy] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const handleDecode = async (result) => {
    // Ambil text dari result
    const text = result?.[0]?.rawValue || result?.text || result;
    
    if (!text || busy) return;
    
    setBusy(true);
    
    // Panggil callback onDetected
    if (onDetected) {
      await onDetected(text);
    }

    // Beri jeda 2 detik biar tidak spam decode berulang
    setTimeout(() => setBusy(false), 2000);
  };

  const handleError = (error) => {
    console.error('QR Scanner error:', error);
    
    // Deteksi jenis error kamera
    if (error?.name === 'NotAllowedError') {
      setCameraError('Izin kamera ditolak. Klik ikon kunci 🔒 di address bar dan izinkan akses kamera.');
    } else if (error?.name === 'NotFoundError') {
      setCameraError('Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.');
    } else if (error?.name === 'NotReadableError') {
      setCameraError('Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain dan refresh halaman.');
    } else if (error?.name === 'OverconstrainedError') {
      setCameraError('Kamera tidak mendukung resolusi yang diminta. Mencoba resolusi lebih rendah...');
    } else if (error?.message?.includes('https') || error?.message?.includes('secure')) {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        setCameraError('Untuk test kamera di PC: Buka Chrome → chrome://flags → Search "Insecure origins" → Add http://localhost:5173');
      } else {
        setCameraError('Kamera butuh HTTPS. Jalankan start-ngrok.ps1 atau akses via https://[ngrok-url]');
      }
    } else {
      setCameraError(`Error kamera: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="w-full h-full relative">
      {cameraError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
          <svg className="w-16 h-16 mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
          <p className="text-sm font-bold mb-2">Kamera Tidak Dapat Diakses</p>
          <p className="text-xs text-gray-300 mb-4">{cameraError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <Scanner
          onScan={handleDecode}
          onError={handleError}
          constraints={{
            audio: false,
            video: {
              facingMode: 'environment', // kamera belakang di HP (hapus ideal agar lebih kompatibel)
            },
          }}
          styles={{
            container: { width: '100%', height: '100%' },
            video: { width: '100%', height: '100%', objectFit: 'cover' },
          }}
          components={{
            finder: false, // biar ringan
          }}
          allowMultiple={false}
        />
      )}
    </div>
  );
}
