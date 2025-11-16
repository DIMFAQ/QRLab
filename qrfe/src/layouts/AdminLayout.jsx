import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

// Impor ikon placeholder (gantilah dengan ikon React jika ada)
const IconDashboard = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6-4a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1z"></path></svg>;
const IconSesi = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
const IconMahasiswa = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
const IconRekap = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const IconLogout = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const IconQR = () => <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;


// Komponen NavLink kustom untuk styling
const SidebarNavLink = ({ to, children }) => {
  const baseStyle = "flex items-center gap-4 p-4 rounded-lg text-lg font-bold";
  const activeStyle = "bg-[#076BB2] text-white";
  const inactiveStyle = "text-[#717182] hover:bg-gray-100";

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
    >
      {children}
    </NavLink>
  );
};

// Sidebar (dari desain Anda)
const SidebarNav = ({ onLogout }) => (
  <div className="w-[332px] h-screen bg-white shadow-lg flex flex-col fixed left-0 top-0 z-20">
    {/* Sidebar Header */}
    <div className="flex items-center gap-3 p-4 h-[114px] border-b border-gray-200">
      <div className="w-16 h-16 bg-[#076BB2] rounded-2xl flex items-center justify-center p-3">
        <IconQR />
      </div>
      <div className="text-3xl font-['Arya'] font-bold text-black">Admin QR-Lab</div>
    </div>

    {/* Navigasi */}
    <nav className="flex-grow p-4 space-y-2">
      <SidebarNavLink to="dashboard">
        <IconDashboard />
        Dashboard
      </SidebarNavLink>
      <SidebarNavLink to="sesi">
        <IconSesi />
        Kelola Sesi
      </SidebarNavLink>
      <SidebarNavLink to="rekap">
        <IconRekap />
        Rekap Absensi
      </SidebarNavLink>
      <SidebarNavLink to="mahasiswa">
        <IconMahasiswa />
        Kelola Mahasiswa
      </SidebarNavLink>
    </nav>

    {/* Logout */}
    <div className="p-4 border-t border-gray-200">
      <button onClick={onLogout} className="flex items-center gap-4 p-4 rounded-lg text-lg text-[#717182] font-bold bg-[#D9D9D9] w-full hover:bg-gray-300">
        <IconLogout />
        Logout
      </button>
    </div>
  </div>
);

// Header Utama (dari desain Anda)
const MainHeader = ({ user }) => (
  <header className="h-[114px] bg-white flex justify-between items-center p-8 border-b border-gray-200 sticky top-0 z-10">
    {/* Judul Halaman akan dinamis nanti, untuk sekarang 'Dashboard' */}
    <h1 className="text-4xl font-['Arimo'] font-bold text-slate-800">Dashboard</h1>
    <div className="flex items-center gap-4">
      <span className="text-xl font-['Arimo'] hidden md:inline">{user?.name ?? 'Admin'}</span>
      <img
        className="w-14 h-14 rounded-full"
        src="https://placehold.co/55x55" // Placeholder avatar
        alt="Admin"
      />
    </div>
  </header>
);

// Layout Utama
export default function AdminLayout({ user, onLogout }) {
  return (
    <div className="flex w-full h-full min-h-screen">
      <SidebarNav onLogout={onLogout} />

      <div className="flex-1 flex flex-col ml-[332px]">
        <MainHeader user={user} />

        {/* Konten Halaman (Dashboard, Sesi, dll.) akan dirender di sini */}
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
}