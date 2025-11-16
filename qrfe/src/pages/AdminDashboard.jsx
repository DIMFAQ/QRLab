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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminDashboard() {
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

  return (
    <div className="space-y-6">
      
      {/* CARD STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {[
          { label: "Total Mahasiswa", key: "mahasiswa" },
          { label: "Total Dosen", key: "dosen" },
          { label: "Total Kelas", key: "kelas" },
          { label: "Pertemuan Hari Ini", key: "pertemuan" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border shadow-sm">
            <div className="text-xs text-gray-500">{item.label}</div>
            <div className="text-3xl font-bold mt-2">{stats[item.key] ?? 0}</div>
          </div>
        ))}

      </div>

      {/* GRAFIK */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold mb-4">Grafik Kehadiran Minggu Ini</h3>
        <Bar data={chartData} />
      </div>

    </div>
  );
}
