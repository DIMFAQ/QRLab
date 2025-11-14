import React from 'react';
import AdminMeetings from '../components/AdminMeetings'; // <-- Ini file yang Anda kirim
import AdminUserVerification from '../components/AdminUserVerification'; // <-- Ini file antrian yang baru

// Ini adalah halaman "Dasbor" Admin
export default function AdminMeetingsPage() {
  return (
    <div className="container mx-auto p-4">
      
      {/* Komponen baru untuk antrian verifikasi, diletakkan di atas */}
      <AdminUserVerification />

      {/* Komponen manajemen pertemuan yang sudah ada, diletakkan di bawah */}
      <AdminMeetings />
      
    </div>
  );
}