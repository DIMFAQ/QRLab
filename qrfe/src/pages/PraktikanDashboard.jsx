import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const IconCalendar = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd"
      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
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
// STATUS PILL COMPONENT
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

// ----------------------------
// PAGE SCANNER (SCAN QR)
// ----------------------------
const PageScanner = ({ onScanSuccess }) => {
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
      
      // Trigger refresh jadwal dan riwayat setelah 1 detik
      setTimeout(() => {
        if (onScanSuccess) onScanSuccess();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal melakukan presensi.');
    }
  };

  return (
    <div className="flex flex-col items-center pt-6 px-4">
      <h2 className="text-2xl text-center font-['Arimo'] font-bold text-gray-800 mb-6">
        Scan Untuk Presensi
      </h2>

      <div className="w-full max-w-sm aspect-square bg-black relative overflow-hidden rounded-lg border-4 border-[#076BB2] shadow-lg">
        <QrScannerComponent onDetected={handleScan} />

        {/* Border Sudut Mockup */}
        <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-white"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-white"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-white"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-white"></div>
      </div>

      {/* Message Display */}
      {success && (
        <div className="mt-4 w-full max-w-sm p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
          ✅ {success}
        </div>
      )}

      {error && (
        <div className="mt-4 w-full max-w-sm p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
          ❌ {error}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500 text-center px-4">
        Arahkan kamera ke QR Code yang ditampilkan admin
      </p>
    </div>
  );
};

// ----------------------------
// PAGE HISTORY (RIWAYAT)
// ----------------------------
const PageHistory = ({ refreshKey }) => {
  const [data, setData] = useState({ summary: {}, history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get('/praktikan/history');
        setData({
          summary: res.data.summary || { hadir: 0, terlambat: 0, alpa: 0 },
          history: Array.isArray(res.data.history) ? res.data.history : []
        });
      } catch (e) {
        console.error("Gagal memuat riwayat", e);
        setData({ summary: { hadir: 0, terlambat: 0, alpa: 0 }, history: [] });
      }
      setLoading(false);
    };

    loadHistory();
  }, [refreshKey]); // Re-load when refreshKey changes

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

        {!loading && (!history || history.length === 0) && (
          <div className="text-center p-4 text-gray-500">Belum ada riwayat.</div>
        )}

        <div className="divide-y divide-gray-200">
          {!loading && history && history.map((item) => (
            <div key={item.id} className="py-3">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    {item.course_code} - Pertemuan {item.meeting_number}
                  </div>
                  <div className="text-xs text-gray-600">
                    {item.course_name} - {item.class_name}
                  </div>
                </div>
                <StatusPill status={item.status} />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {item.scanned_at ? item.scanned_at : 'Tidak hadir'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ----------------------------
// PAGE SCHEDULE (JADWAL)
// ----------------------------
const PageSchedule = ({ refreshKey }) => {
  const [schedules, setSchedules] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const res = await api.get('/praktikan/jadwal');
        console.log('Jadwal response:', res.data);
        
        setEnrollments(res.data.enrollments || []);
        
        // Backend sudah filter: hanya kirim meeting yang belum terlaksana (belum presensi)
        // Tidak perlu filter lagi di frontend
        const allSchedules = res.data.schedules || [];
        
        console.log('Total schedules:', allSchedules.length);
        
        setSchedules(allSchedules);
      } catch (e) {
        console.error('Gagal memuat jadwal', e);
      }
      setLoading(false);
    };

    loadSchedule();
  }, [refreshKey]); // Re-load when refreshKey changes

  // Helper: Convert UTC to Jakarta timezone (UTC+7)
  const toJakartaTime = (utcDateString) => {
    if (!utcDateString) return null;
    const date = new Date(utcDateString);
    if (Number.isNaN(date.getTime())) return null;
    // Add timezone offset untuk Jakarta (UTC+7 = 420 minutes)
    return new Date(date.getTime() + (7 * 60 * 60 * 1000));
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return '-';
    const jakartaDate = toJakartaTime(datetime);
    if (!jakartaDate) return '-';
    return jakartaDate.toLocaleString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (datetime) => {
    if (!datetime) return '-';
    const jakartaDate = toJakartaTime(datetime);
    if (!jakartaDate) return '-';
    return jakartaDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4">
      {/* Enrollment Info */}
      {enrollments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-bold text-blue-800 mb-2">Praktikum yang Diikuti:</h3>
          <div className="space-y-1">
            {enrollments.map((e, idx) => (
              <div key={idx} className="text-xs text-blue-700">
                📚 {e.course} - {e.class}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4">Jadwal Pertemuan Mendatang</h3>

        {loading && <div className="text-center p-4">Memuat...</div>}

        {!loading && schedules.length === 0 && (
          <div className="text-center p-4 text-gray-500">
            Tidak ada jadwal mendatang. Semua pertemuan sudah selesai atau belum dijadwalkan.
          </div>
        )}

        <div className="space-y-3">
          {schedules.map((item) => {
            const isUpcoming = new Date(item.start_time) > new Date();
            
            return (
              <div
                key={item.id}
                className={`border rounded-lg p-3 ${
                  item.is_open
                    ? 'bg-yellow-50 border-yellow-300'
                    : isUpcoming
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-800">
                      {item.course_code} - Pertemuan {item.meeting_number}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.course_name} - {item.class_name}
                    </div>
                  </div>
                  {item.is_open && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">
                      🔴 BUKA - SEGERA PRESENSI
                    </span>
                  )}
                  {!item.is_open && isUpcoming && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-200 text-blue-800">
                      📅 AKAN DATANG
                    </span>
                  )}
                  {!item.is_open && !isUpcoming && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                      ⏳ BELUM PRESENSI
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div>📅 {formatDateTime(item.start_time)}</div>
                  <div>⏱️ {formatTime(item.start_time)} - {formatTime(item.end_time)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ----------------------------
// MAIN DASHBOARD
// ----------------------------
export default function PraktikanDashboard({ user }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleScanSuccess = () => {
    // Increment refreshKey to trigger reload of PageHistory and PageSchedule
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    loadProfilePhoto();
    
    // Listen untuk update dari ProfileSettings
    const handleProfileUpdate = () => {
      loadProfilePhoto();
    };
    
    window.addEventListener('profilePhotoUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profilePhotoUpdated', handleProfileUpdate);
    };
  }, []);

  const loadProfilePhoto = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.profile_photo) {
        setProfilePhoto(res.data.profile_photo);
      } else {
        setProfilePhoto(null);
      }
    } catch (error) {
      console.error('Failed to load profile photo:', error);
      // Set null untuk menghindari retry terus-menerus
      setProfilePhoto(null);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {}
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  const renderPage = () => {
    if (activePage === 'dashboard') return <PageScanner onScanSuccess={handleScanSuccess} />;
    if (activePage === 'jadwal') return <PageSchedule refreshKey={refreshKey} />;
    if (activePage === 'history') return <PageHistory refreshKey={refreshKey} />;
    return <PageScanner onScanSuccess={handleScanSuccess} />;
  };

  const NavButton = ({ icon, label, page }) => (
    <button
      onClick={() => {
        setActivePage(page);
        setSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
        activePage === page ? 'bg-[#076BB2] text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="ml-3 font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#E9E9E9] w-full mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-[#076BB2] flex items-center justify-between px-4 sticky top-0 z-20 shadow-md">
        <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-white/10 rounded-lg transition">
          <IconMenu />
        </button>
        <span className="text-white text-lg font-bold">QR-Lab</span>
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md cursor-pointer"
            onClick={() => navigate('/profile')}
          />
        ) : (
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer"
            onClick={() => navigate('/profile')}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white w-64 z-40 shadow-xl p-4 transform transition-transform duration-300 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center mb-6 p-2">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 shadow-md"
            />
          ) : (
            <div className="w-10 h-10 bg-[#076BB2] rounded-full flex items-center justify-center text-white font-bold border-2 border-blue-300">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="ml-3 overflow-hidden flex-1">
            <div className="text-sm font-bold truncate">{user?.name || 'User'}</div>
            <div className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full mt-1 truncate inline-block">
              {user?.member?.npm || user?.email || 'Praktikan'}
            </div>
          </div>
        </div>

        <hr className="border-gray-300 mb-4" />

        <nav className="space-y-2">
          <NavButton icon={<IconDashboard />} label="Dashboard" page="dashboard" />
          <NavButton icon={<IconCalendar />} label="Jadwal Pertemuan" page="jadwal" />
          <NavButton icon={<IconHistory />} label="Riwayat Presensi" page="history" />
          <button 
            onClick={() => navigate('/profile')} 
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="ml-3 font-medium text-sm">Profil Saya</span>
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <IconLogout />
            <span className="ml-3 font-medium text-sm">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="pb-4">{renderPage()}</main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 p-4 mt-10">
        © 2025 QR-Lab Unila | Fakultas Teknik
      </footer>
    </div>
  );
}
