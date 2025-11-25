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
    {
      label: "Absensi Hari Ini",
      value: stats.hadir_hari_ini,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-[#076BB2]",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
    },
    {
      label: "Sesi Aktif",
      value: stats.sesi_aktif,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
    },
    {
      label: "Total Jadwal",
      value: stats.pertemuan,
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      ),
    },
  ];

  const quickMenus = [
    {
      label: "Manajemen Mahasiswa",
      desc: "Kelola data dan registrasi mahasiswa",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ),
      onClick: () => navigate("/admin/mahasiswa"),
    },
    {
      label: "Kelola Sesi",
      desc: "Buat sesi absensi baru",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
        </svg>
      ),
      onClick: () => navigate("/admin/sesi"),
    },
    {
      label: "Rekap Absensi",
      desc: "Lihat laporan kehadiran",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      ),
      onClick: () => navigate("/admin/rekap"),
    },
  ];

  const chartData = useMemo(() => {
    if (!weekly.labels?.length) {
      return [];
    }

    return weekly.labels.map((label, idx) => ({
      label,
      hadir: weekly.hadir?.[idx] ?? 0,
      total: weekly.total?.[idx] ?? (stats.mahasiswa || 0),
    }));
  }, [stats.mahasiswa, weekly.hadir, weekly.labels, weekly.total]);

  const chartMaxValues = chartData.map((item) => Math.max(item.total, item.hadir));
  const safeMaxChartValue = chartMaxValues.length
    ? Math.max(...chartMaxValues, 1)
    : Math.max(stats.mahasiswa || 0, 1);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <p className="text-sm text-slate-600 mb-1">Ringkasan data absensi hari ini</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">{card.label}</p>
                <p className={`text-3xl font-bold ${card.textColor}`}>
                  {loading ? "..." : formatNumber(card.value)}
                </p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-xl ${card.textColor}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Menu Cepat */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Menu Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickMenus.map((menu) => (
            <button
              key={menu.label}
              type="button"
              onClick={menu.onClick}
              className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-[#076BB2] hover:shadow-lg transition-all text-center group"
            >
              <div className="text-[#076BB2] mb-4 flex justify-center group-hover:scale-110 transition-transform">
                {menu.icon}
              </div>
              <p className="text-base font-semibold text-slate-800 mb-2">{menu.label}</p>
              <p className="text-sm text-slate-500">{menu.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Grafik Kehadiran */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Grafik Kehadiran Minggu Ini</h3>
          <p className="text-sm text-slate-500">
            Perbandingan Jumlah mahasiswa hadir dengan total mahasiswa per hari
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: '#076BB2' }}></div>
              <p>Memuat data...</p>
            </div>
          </div>
        ) : chartData.length ? (
          <>
            <div className="flex items-end justify-around h-64 px-4 mb-8">
              {chartData.map((item, idx) => {
                const percent = item.total ? Math.round((item.hadir / item.total) * 100) : 0;
                const totalHeight = Math.max((item.total / safeMaxChartValue) * 100, 10);
                const hadirHeight = Math.max((item.hadir / safeMaxChartValue) * 100, 6);

                return (
                  <div key={item.label} className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
                    <div className="relative w-full h-48 flex items-end justify-center">
                      <div
                        className="w-10 rounded-t-lg bg-slate-200"
                        style={{ height: `${Math.min(totalHeight, 100)}%` }}
                      />
                      <div
                        className="absolute bottom-0 w-10 rounded-t-lg"
                        style={{ height: `${Math.min(hadirHeight, 100)}%`, backgroundColor: '#076BB2' }}
                      />
                    </div>
                    <p className="text-xs font-medium text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-500">{percent}%</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-slate-600 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#076BB2' }}></div>
                <span>Mahasiswa Hadir</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-slate-200"></div>
                <span>Total Mahasiswa</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{avgAttendancePercent}%</p>
                <p className="text-xs text-slate-500 mt-1">Rata-rata kehadiran</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{formatNumber(totalWeeklyAttendance)}</p>
                <p className="text-xs text-slate-500 mt-1">Total Kehadiran</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{formatNumber(stats.mahasiswa)}</p>
                <p className="text-xs text-slate-500 mt-1">Total Mahasiswa</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <p>Belum ada data minggu ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
