// Isi untuk: qrfe/src/pages/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import api from "../api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { FaUsers, FaChalkboardTeacher, FaSchool, FaClock } from 'react-icons/fa';

// Registrasi ChartJS (dari file Anda)
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Komponen Kartu Statistik
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
    {icon}
  </div>
);

export default function AdminDashboard() {
  // Semua state dan logic Anda dipertahankan
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [weekly, setWeekly] = useState({
    labels: [],
    hadir: [],
    total: [],
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const s = await api.get("/admin/stats");
        setStats(s.data || {});
      } catch (e) {
        console.log("Stats error:", e);
      }
      try {
        const w = await api.get("/admin/stats/weekly");
        setWeekly(w.data || { labels: [], hadir: [], total: [] });
      } catch (e) {
        console.log("Weekly error:", e);
      }
      setLoading(false);
    };
    loadDashboard();
  }, []);

  // Data chart dari state Anda
  const chartData = {
    labels: weekly.labels,
    datasets: [
      {
        label: "Hadir",
        data: weekly.hadir,
        backgroundColor: "#2563EB",
      },
      {
        label: "Total Mahasiswa",
        data: weekly.total,
        backgroundColor: "#D9E6FF",
      },
    ],
  };

  // Data kartu dari state Anda
  const statCards = [
    { 
      label: "Total Mahasiswa", 
      key: "mahasiswa", 
      icon: <FaUsers className="text-4xl text-blue-500" /> 
    },
    { 
      label: "Total Dosen", 
      key: "dosen", 
      icon: <FaChalkboardTeacher className="text-4xl text-green-500" /> 
    },
    { 
      label: "Total Kelas", 
      key: "kelas", 
      icon: <FaSchool className="text-4xl text-yellow-500" /> 
    },
    { 
      label: "Pertemuan Hari Ini", 
      key: "pertemuan", 
      icon: <FaClock className="text-4xl text-purple-500" /> 
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Pesan Selamat Datang (dari gambar) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold">Selamat Datang, Admin!</h2>
        <p className="text-gray-600 mt-1">
          Anda dapat mengelola sesi, praktikan, dan melihat rekap absensi di sini.
        </p>
      </div>
      
      {/* CARD STATISTIK (menggunakan data Anda) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((item) => (
          <StatCard
            key={item.key}
            title={item.label}
            value={loading ? '...' : (stats[item.key] ?? 0)}
            icon={item.icon}
          />
        ))}
      </div>

      {/* GRAFIK (dari file Anda) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold mb-4">Grafik Kehadiran Minggu Ini</h3>
        {loading ? (
          <div>Memuat grafik...</div>
        ) : (
          <Bar data={chartData} />
        )}
      </div>
    </div>
  );
}