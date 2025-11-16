// src/layouts/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

const NavItem = ({ to, children }) => {
  return (
    <NavLink
      to={to}
      end={false}
      className={({ isActive }) =>
        `flex items-center space-x-3 p-2 rounded-lg transition-colors ${
          isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  );
};

const AdminLayout = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col fixed h-full">
        <div className="h-16 flex items-center justify-center text-2xl font-bold shadow-md">
          PRESENSI QR
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-auto">
          <NavItem to="/admin/dashboard">
            <span className="inline-block w-5" aria-hidden>🏠</span>
            <span>Dashboard</span>
          </NavItem>

          <div className="text-xs text-gray-400 px-2 pt-4 pb-1 uppercase font-semibold">
            Master Data
          </div>

          {/* <-- FIXED PATHS TO MATCH App.jsx --> */}
          <NavItem to="/admin/sesi">
            <span className="inline-block w-5" aria-hidden>🗓️</span>
            <span>Kelola Sesi</span>
          </NavItem>

          <NavItem to="/admin/mahasiswa">
            <span className="inline-block w-5" aria-hidden>👥</span>
            <span>Kelola Mahasiswa</span>
          </NavItem>

          <NavItem to="/admin/rekap">
            <span className="inline-block w-5" aria-hidden>📄</span>
            <span>Rekap Absensi</span>
          </NavItem>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || "https://placehold.co/40x40"}
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="text-sm font-medium truncate text-white">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-400 truncate">{user?.member?.npm || user?.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 p-2 w-full rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-64 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
