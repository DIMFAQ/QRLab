import React, { useState, useEffect } from 'react';
import api from '../api';
import QrScannerComponent from '../components/QrScanner';

// --- Ikon Helper ---
const IconMenu = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
      d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
);

const IconDashboard = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 5h10v10H5V5z"></path>
  </svg>
);

const IconHistory = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z"
      clipRule="evenodd"></path>
  </svg>
);

const IconLogout = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd"
      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm12.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 13H9a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z"
      clipRule="evenodd"></path>
  </svg>
);


// ----------------------------
// PAGE SCANNER (SCAN QR)
// ----------------------------
const PageScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleScan = async (qrValue) => {
    if (!qrValue || qrValue === scanResult) return;

    setScanResult(qrValue);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/praktikan/check-in', {
        qr_token: qrValue,
      });
      setSuccess(response.data.message || 'Presensi berhasil!');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal melakukan presensi.');
    }
  };

  return (
    <div className="flex flex-col items-center pt-10">
      <h2 className="text-2xl text-center font-['Arimo'] font-bold text-gray-800 mb-6">
        Scan Untuk Presensi
      </h2>

      <div className="w-64 h-64 bg-black relative overflow-hidden rounded-lg border-2 border-black">
        <QrScannerComponent onDetected={handleScan} />

        {/* Border Sudut Mockup */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-black"></div>
        <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-black"></div>
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-black"></div>
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-black"></div>
      </div>


      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg w-full max-w-xs text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg w-full max-w-xs text-center">
          {success}
        </div>
      )}
    </div>
  );
};


// ----------------------------
// PAGE RIWAYAT
// ----------------------------
const StatusPill = ({ status }) => {
  switch (status) {
    case 'Hadir':
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-200 text-green-800">
          Hadir
        </span>
      );
    case 'Terlambat':
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800">
          Terlambat
        </span>
      );
    case 'Alpa':
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-200 text-red-800">
          Alpa
        </span>
      );
    default:
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
          {status}
        </span>
      );
  }
};

const PageHistory = () => {
  const [data, setData] = useState({ summary: {}, history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get('/praktikan/history');
        setData(res.data);
      } catch (e) {
        console.error("Gagal memuat riwayat", e);
      }
      setLoading(false);
    };

    loadHistory();
  }, []);

  const { summary, history } = data;

  return (
    <div className="p-4">
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h3 className="text-center text-lg font-bold mb-4">Ringkasan Presensi</h3>
        <div className="flex justify-around">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{summary.hadir || 0}</div>
            <div className="text-sm text-green-500">Hadir</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{summary.terlambat || 0}</div>
            <div className="text-sm text-yellow-500">Terlambat</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{summary.alpa || 0}</div>
            <div className="text-sm text-red-500">Alpa</div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4">Riwayat Lengkap</h3>

        {loading && <div className="text-center p-4">Memuat...</div>}

        {!loading && history.length === 0 && (
          <div className="text-center p-4 text-gray-500">Belum ada riwayat.</div>
        )}

        <div className="divide-y divide-gray-200">
          {history.map((item) => (
            <div key={item.id} className="py-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">
                  Judul {item.meeting_number} - {item.meeting_name}
                </span>
                <StatusPill status={item.status} />
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.scanned_at}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// ----------------------------
// MAIN DASHBOARD
// ----------------------------
export default function PraktikanDashboard({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {}
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  const renderPage = () => {
    if (activePage === 'dashboard') return <PageScanner />;
    if (activePage === 'history') return <PageHistory />;
    return <PageScanner />;
  };

  const NavButton = ({ icon, label, page }) => (
    <button
      onClick={() => {
        setActivePage(page);
        setSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 rounded-lg ${
        activePage === page ? 'bg-[#076BB2] text-white' : 'text-gray-700'
      }`}
    >
      {icon}
      <span className="ml-3 font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#E9E9E9] w-full mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-[#076BB2] flex items-center justify-between px-4 sticky top-0 z-20">
        <button onClick={() => setSidebarOpen(true)}>
          <IconMenu />
        </button>
        <span className="text-white text-lg font-bold">QR-Lab</span>
        <img src="https://placehold.co/30x30" className="w-8 h-8 rounded-full" />
      </header>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)}></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-[#E9E9E9] w-64 z-40 shadow-lg p-4 transform transition-transform duration-300 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center mb-4 p-2">
          <img src="https://placehold.co/40x40" className="w-10 h-10 rounded-full border border-blue-500" />
          <div className="ml-3 overflow-hidden">
            <div className="text-xs font-bold truncate">{user.name}</div>
            <div className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full mt-1 truncate">
              {user.member?.npm || user.email}
            </div>
          </div>
        </div>

        <hr className="border-gray-300 mb-4" />

        <nav className="space-y-2">
          <NavButton icon={<IconDashboard />} label="Dashboard" page="dashboard" />
          <NavButton icon={<IconHistory />} label="Riwayat Presensi" page="history" />
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-gray-700">
            <IconLogout />
            <span className="ml-3 font-medium text-sm">Logout</span>
          </button>
        </nav>
      </div>

      <main className="p-4">{renderPage()}</main>

      <footer className="text-center text-xs text-gray-500 p-4 mt-10">
        © 2025 QR-Lab Unila | Fakultas Teknik
      </footer>
    </div>
  );
}
