import React, { useState, useEffect } from 'react';
import api from '../api'; // Perlu api untuk fetch data stats

// Ikon placeholder
const IconPlaceholder = ({ className = "w-8 h-8" }) => <div className={`${className} bg-gray-300 rounded`}></div>;

// Komponen Kartu Statistik
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg border-2 border-[rgba(112,112,112,0.63)] flex justify-between items-center">
    <div>
      <div className="text-2xl text-[#717182] mb-2">{title}</div>
      <div className="text-5xl font-bold text-slate-800">{value}</div>
    </div>
    <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center`}>
      {icon}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    mahasiswa: 0,
    sesiAktif: 0,
    kehadiran: '0%',
  });
  const [loading, setLoading] = useState(true);

  // TODO: Ganti dengan endpoint API Anda yang sebenarnya untuk data dashboard
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // PANGGIL API DI SINI
        // const { data } = await api.get('/admin/stats');
        
        // Data dummy untuk sekarang
        const dummyData = {
          mahasiswa: 137,
          sesiAktif: 2,
          kehadiran: '93%',
        };
        setStats(dummyData);

      } catch (error) {
        console.error("Gagal memuat stats", error);
        // Set data error/default
        setStats({ mahasiswa: 'Error', sesiAktif: 'Error', kehadiran: 'Error' });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  
  const valueDisplay = (val) => (loading ? '...' : val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Mahasiswa"
        value={valueDisplay(stats.mahasiswa)}
        icon={<IconPlaceholder />}
        color="bg-[#C4DBEC]"
      />
      <StatCard
        title="Sesi Praktikum Aktif"
        value={valueDisplay(stats.sesiAktif)}
        icon={<IconPlaceholder />}
        color="bg-[rgba(144,226,162,0.79)]"
      />
      <StatCard
        title="Kehadiran Hari Ini"
        value={valueDisplay(stats.kehadiran)}
        icon={<IconPlaceholder />}
        color="bg-[rgba(255,234,0,0.45)]"
      />
    </div>
  );
}