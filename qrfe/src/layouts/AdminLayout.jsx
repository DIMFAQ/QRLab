// src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Derive simple page title from path (Dashboard, Kelola Sesi, dsb.)
  const routeToTitle = (pathname) => {
    if (pathname.startsWith("/admin/sesi")) return "Kelola Sesi";
    if (pathname.startsWith("/admin/rekap")) return "Rekap Absensi";
    if (pathname.startsWith("/admin/mahasiswa")) return "Kelola Mahasiswa";
    return "Dashboard";
  };

  const title = routeToTitle(location.pathname);

  const NavItem = ({ to, children, exact = false }) => (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
          isActive ? "bg-[#E6F0FF] text-[#1E40AF]" : "text-slate-700 hover:bg-slate-50"
        }`
      }
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </NavLink>
  );

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col">
        <div className="px-6 py-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center text-white font-bold">QR</div>
            <div>
              <div className="text-lg font-semibold">PresensiQR</div>
              <div className="text-xs text-slate-500">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-auto">
          <NavItem to="/admin/dashboard" exact>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="font-medium">Dashboard</span>
          </NavItem>

          <div className="text-xs text-slate-400 px-3 mt-4 mb-2">Master Data</div>

          <NavItem to="/admin/mahasiswa">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zM6 20a6 6 0 0112 0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-medium">Mahasiswa</span>
          </NavItem>

          <NavItem to="/admin/sesi">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h18M6 7v12a2 2 0 002 2h8a2 2 0 002-2V7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-medium">Kelola Sesi</span>
          </NavItem>

          <NavItem to="/admin/rekap">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-medium">Rekap Kehadiran</span>
          </NavItem>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || "https://placehold.co/40x40"} alt="avatar" className="w-10 h-10 rounded-full" />
            <div>
              <div className="text-sm font-medium truncate">{user?.name || "Admin"}</div>
              <div className="text-xs text-slate-500 truncate">{user?.member?.npm || user?.email}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="mt-4 w-full text-left px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar (drawer) */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside className={`absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="px-6 py-5 border-b flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center text-white font-bold">QR</div>
            <div>
              <div className="text-lg font-semibold">PresensiQR</div>
              <div className="text-xs text-slate-500">Admin</div>
            </div>
          </div>

          <nav className="px-3 py-4 space-y-1">
            <NavItem to="/admin/dashboard" exact>Dashboard</NavItem>
            <div className="text-xs text-slate-400 px-3 mt-4 mb-2">Master Data</div>
            <NavItem to="/admin/mahasiswa">Mahasiswa</NavItem>
            <NavItem to="/admin/sesi">Kelola Sesi</NavItem>
            <NavItem to="/admin/rekap">Rekap Kehadiran</NavItem>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <img src={user?.avatar || "https://placehold.co/40x40"} alt="avatar" className="w-10 h-10 rounded-full" />
              <div>
                <div className="text-sm font-medium truncate">{user?.name || "Admin"}</div>
                <div className="text-xs text-slate-500 truncate">{user?.member?.npm || user?.email}</div>
              </div>
            </div>

            <button
              onClick={() => { setMobileOpen(false); onLogout && onLogout(); }}
              className="mt-4 w-full text-left px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Logout
            </button>
          </div>
        </aside>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button className="lg:hidden p-2 rounded-md hover:bg-slate-100" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <div className="text-lg font-semibold">{title}</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 hidden sm:block">Hi, {user?.name || "Admin"}</div>
            <img src={user?.avatar || "https://placehold.co/40x40"} alt="avatar" className="w-9 h-9 rounded-full" />
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>

        <footer className="bg-white border-t p-4 text-xs text-slate-500">
          © 2025 PresensiQR — Sistem Presensi QR Code
        </footer>
      </div>
    </div>
  );
}
