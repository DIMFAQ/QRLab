import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const numberFormatter = new Intl.NumberFormat("id-ID");

const formatNumber = (value) => {
  if (value === null || value === undefined) {
    return "0";
  }
  return numberFormatter.format(value);
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mahasiswa: 0,
    hadir_hari_ini: 0,
    sesi_aktif: 0,
    pertemuan: 0,
  });
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
        setStats((prev) => ({ ...prev, ...s.data }));
      } catch (error) {
        console.log("Stats error:", error);
      }

      try {
        const w = await api.get("/admin/stats/weekly");
        if (w.data) {
          setWeekly(w.data);
        }
      } catch (error) {
        console.log("Weekly error:", error);
      }

      try {
        const u = await api.get("/admin/users");
        const count = Array.isArray(u.data) ? u.data.length : u.data?.total ?? 0;
        setStats((prev) => ({ ...prev, mahasiswa: count }));
      } catch (error) {
        console.log("Mahasiswa count error:", error);
      }

      setLoading(false);
    };

    loadDashboard();
  }, []);

  const totalWeeklyAttendance = weekly.hadir?.reduce((a, b) => a + b, 0) || 0;
  const totalWeeklySlots = weekly.total?.reduce((a, b) => a + b, 0) || 0;
  const avgAttendancePercent = totalWeeklySlots > 0
    ? Math.round((totalWeeklyAttendance / totalWeeklySlots) * 100)
    : 0;

  const statCards = [
    {
      label: "Total Mahasiswa",
      value: stats.mahasiswa,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div>Test</div>
  );
}
