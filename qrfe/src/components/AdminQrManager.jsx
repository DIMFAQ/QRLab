import React, { useState, useEffect } from 'react';
import api from '../api';
// KOREKSI UTAMA: Mengatasi error 'default export'
import * as QRCodeModule from 'qrcode.react';
const QRCode = QRCodeModule.default || QRCodeModule; 


const AdminQrManager = () => {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchActiveQr = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/admin/attendance/qr/active'); 
            setQrData(response.data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setQrData(null); 
            } else {
                setError('Gagal memuat sesi QR aktif. Cek koneksi.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQr = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/admin/attendance/qr/generate');
            setQrData(response.data);
            alert('Sesi QR baru berhasil dibuat!');
        } catch (err) {
            setError('Gagal membuat sesi QR baru.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveQr();
        const intervalId = setInterval(fetchActiveQr, 30000); 
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="max-w-lg mx-auto p-6 bg-gray-50 border rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Pengelola Sesi QR Absensi</h2>
            
            {loading && !qrData && <p className="text-center text-blue-500">Memuat data...</p>}
            {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}

            {qrData && qrData.qr_token ? (
                <div className="text-center">
                    <p className="text-lg font-semibold mb-3 text-green-600">Sesi QR Code Saat Ini Aktif!</p>
                    <div className="inline-block p-4 border-4 border-gray-900 bg-white">
                        <QRCode value={qrData.qr_token} size={256} level="H" /> 
                    </div>
                    <p className="mt-4 text-gray-700">
                        Token: <span className="font-mono bg-gray-200 p-1 rounded font-semibold">{qrData.qr_token}</span>
                    </p>
                    <p className="text-sm text-red-500 mt-1">
                        **Kadaluwarsa:** {new Date(qrData.expires_at).toLocaleTimeString()} (Sisa: {qrData.minutes_left} menit)
                    </p>
                </div>
            ) : (
                <div className="text-center p-4 border border-dashed border-gray-400 rounded-md">
                    <p className="text-lg text-gray-500">Tidak ada sesi QR yang aktif saat ini.</p>
                </div>
            )}

            <button 
                onClick={handleGenerateQr} 
                disabled={loading}
                className="mt-8 w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 disabled:bg-gray-400"
            >
                {loading ? 'Memproses...' : (qrData && qrData.qr_token ? 'Reset & Buat QR Baru' : 'Mulai Sesi Absensi (Buat QR)')}
            </button>
        </div>
    );
};

export default AdminQrManager;