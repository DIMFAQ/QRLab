import React, { useState } from 'react';
import QrScannerComponent from '../components/QrScanner';
import AttendanceHistory from '../components/AttendanceHistory';

export default function PraktikanDashboard({ user }) {
  const [tab, setTab] = useState('scan'); // 'scan' | 'riwayat'

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 rounded-xl bg-white p-4 shadow ring-1 ring-slate-200">
        <p className="text-sm text-slate-600">Halo,</p>
        <p className="text-lg font-semibold text-slate-800">{user?.name ?? '-'}</p>
        <p className="text-xs text-slate-500">Role: Praktikan</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setTab('scan')}
          className={`rounded-lg py-2 font-semibold ${tab === 'scan'
            ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}
        >
          Scan
        </button>
        <button
          onClick={() => setTab('riwayat')}
          className={`rounded-lg py-2 font-semibold ${tab === 'riwayat'
            ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}
        >
          Riwayat
        </button>
      </div>

      {tab === 'scan' ? <QrScannerComponent /> : <AttendanceHistory />}
    </div>
  );
}
