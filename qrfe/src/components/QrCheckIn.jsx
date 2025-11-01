import React, { useState } from 'react';
import api from '../api';
import QrScanner from 'react-qr-scanner';

const QrCheckIn = ({ user }) => {
    const [scanResult, setScanResult] = useState('');
    const [checkinStatus, setCheckinStatus] = useState({ message: '', type: '' });
    const [isScanning, setIsScanning] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleError = (err) => {
        console.error(err);
        setCheckinStatus({ message: 'Gagal mengakses kamera.', type: 'error' });
    };

    const handleScan = async (data) => {
        if (data && isScanning) {
            const qr_token = data.text;
            setScanResult(qr_token);
            setIsScanning(false); 
            setLoading(true);
            setCheckinStatus({ message: 'Memvalidasi token dan melakukan absensi...', type: 'info' });

            try {
                const response = await api.post('/attendance/checkin-qr', { 
                    qr_token: qr_token 
                });

                setCheckinStatus({ 
                    message: response.data.message, 
                    type: 'success' 
                });
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat check-in.';
                setCheckinStatus({ 
                    message: `Absensi Gagal: ${errorMessage}`, 
                    type: 'error' 
                });
                setIsScanning(true);
            } finally {
                setLoading(false);
            }
        }
    };
    
    const previewStyle = {
        height: 240,
        width: '100%',
        maxWidth: 320,
        margin: '0 auto'
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white border rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Absensi Praktikum</h2>

            {user?.member?.name && (
                <p className="mb-4 text-lg text-gray-600">Halo, **{user.member.name}**!</p>
            )}

            {isScanning && !loading ? (
                <div className="flex justify-center items-center flex-col">
                    <div style={previewStyle} className="mb-4 overflow-hidden rounded-lg border border-gray-300">
                        <QrScanner
                            delay={300}
                            style={{ width: '100%', height: '100%' }}
                            onError={handleError}
                            onScan={handleScan}
                            constraints={{ video: { facingMode: "environment" } }}
                        />
                    </div>
                    <p className="mt-4 text-gray-600 font-semibold">Arahkan kamera ke QR Code Admin.</p>
                </div>
            ) : (
                <div className="py-8">
                    <p className="text-lg font-semibold mb-4">
                        QR Code Terpindai: **{scanResult.substring(0, 5)}...**
                    </p>
                    {checkinStatus.type === 'error' && (
                        <button 
                            onClick={() => {
                                setIsScanning(true);
                                setScanResult('');
                                setCheckinStatus({ message: '', type: '' });
                            }}
                            disabled={loading}
                            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
                        >
                            Pindai Ulang
                        </button>
                    )}
                </div>
            )}

            {checkinStatus.message && (
                <div className={`mt-6 p-4 rounded-lg font-medium ${
                    checkinStatus.type === 'success' ? 'bg-green-100 text-green-700 border-l-4 border-green-500' :
                    checkinStatus.type === 'error' ? 'bg-red-100 text-red-700 border-l-4 border-red-500' :
                    'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                }`}>
                    {checkinStatus.message}
                </div>
            )}
        </div>
    );
};

export default QrCheckIn;