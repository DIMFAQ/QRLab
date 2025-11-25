// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../api';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/admin/sesi', label: 'Kelola Sesi', icon: '🗓️' },
  { to: '/admin/mahasiswa', label: 'Kelola Mahasiswa', icon: '👥' },
  { to: '/admin/enrollment', label: 'Kelola Enrollment', icon: '📋' },
  { to: '/admin/rekap', label: 'Rekap Absensi', icon: '📄' },
  { to: '/admin/password-resets', label: 'Reset Password', icon: '🔑' },
  { to: '/profile', label: 'Profil Saya', icon: '👤' },
];

const AdminLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState(null);

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
      }
    } catch (error) {
      console.error('Failed to load profile photo:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-80 flex flex-col" style={{ backgroundColor: '#0B456E' }}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-white/95 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10" style={{ color: '#0B456E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">Admin QR-Lab</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 pt-8 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold transition ${
                  isActive
                    ? 'bg-white/95 shadow-md'
                    : 'text-white/90 hover:bg-white/10'
                }`
              }
              style={({ isActive }) => isActive ? { color: '#0B456E' } : {}}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-white font-semibold transition shadow-md hover:opacity-90"
            style={{ backgroundColor: '#008EF2' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col bg-white">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
          </div>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-teal-100 shadow"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg border-2 border-teal-100 shadow">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
