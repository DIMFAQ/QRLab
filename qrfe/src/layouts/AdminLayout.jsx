// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const NAV_ITEMS = [
  { 
    to: '/admin/dashboard', 
    label: 'Dashboard', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
      </svg>
    )
  },
  { 
    to: '/admin/sesi', 
    label: 'Kelola Sesi', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    )
  },
  { 
    to: '/admin/mahasiswa', 
    label: 'Kelola Mahasiswa', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
    )
  },
  { 
    to: '/admin/enrollment', 
    label: 'Kelola Enrollment', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
    )
  },
  { 
    to: '/admin/rekap', 
    label: 'Rekap Absensi', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
    )
  },
  { 
    to: '/admin/password-resets', 
    label: 'Reset Password', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
      </svg>
    )
  },
];

const AdminLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Get active page title based on current path
  const getActiveTitle = () => {
    if (location.pathname === '/profile') return 'Profil Saya';
    const activeItem = NAV_ITEMS.find(item => location.pathname.startsWith(item.to));
    return activeItem ? activeItem.label : 'Dashboard';
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
                `flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white/95 shadow-lg backdrop-blur-sm'
                    : 'text-white/90 hover:bg-white/10 hover:translate-x-1'
                }`
              }
              style={({ isActive }) => isActive ? { color: '#0B456E' } : {}}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
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
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{getActiveTitle()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition" 
              onClick={() => navigate('/profile')}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-slate-200">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
              <div className="text-sm">
                <div className="font-semibold text-slate-800">{user?.name || 'Admin'}</div>
                <div className="text-xs text-slate-500">{user?.role || 'Administrator'}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F5F6FA] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
