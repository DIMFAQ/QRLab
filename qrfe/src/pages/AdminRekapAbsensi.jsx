import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminRekapAbsensi() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [meetings, setMeetings] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRekap, setLoadingRekap] = useState(false);

  // Load courses and classes on mount
  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const [coursesRes, classesRes, meetingsRes] = await Promise.all([
          api.get("/admin/courses"),
          api.get("/admin/classes"),
          api.get("/admin/meetings"),
        ]);
        
        setCourses(coursesRes.data || []);
        setClasses(classesRes.data || []);
        setMeetings(meetingsRes.data || []);
        
        // Set default values
        if (coursesRes.data.length > 0) {
          setSelectedCourse(coursesRes.data[0].id);
        }
        if (classesRes.data.length > 0) {
          setSelectedClass(classesRes.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    loadOptions();
  }, []);

  // Filter meetings based on selected course and class
  const filteredMeetings = meetings.filter(m => {
    const matchCourse = !selectedCourse || m.course_id === Number(selectedCourse);
    const matchClass = !selectedClass || m.class_id === Number(selectedClass);
    return matchCourse && matchClass;
  });

  // Set default meeting when filters change
  useEffect(() => {
    if (filteredMeetings.length > 0 && !filteredMeetings.find(m => m.id === selectedMeeting)) {
      setSelectedMeeting(filteredMeetings[0].id);
    } else if (filteredMeetings.length === 0) {
      setSelectedMeeting(null);
    }
  }, [filteredMeetings, selectedMeeting]);

  // Load rekap attendance saat meeting dipilih
  const loadRekap = async (meetingId) => {
    if (!meetingId) return;
    
    setLoadingRekap(true);
    try {
      const res = await api.get(`/admin/meetings/${meetingId}/rekap`);
      setAttendances(res.data || []);
    } catch (e) {
      console.error(e);
      setAttendances([]);
    }
    setLoadingRekap(false);
  };

  const handleTerapkan = () => {
    if (selectedMeeting) {
      loadRekap(selectedMeeting);
    }
  };

  const handleExportCSV = () => {
    if (attendances.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    const selectedMeetingData = meetings.find(m => m.id === selectedMeeting);
    const csvContent = [
      ["NPM", "NAMA", "WAKTU SCAN", "STATUS"],
      ...attendances.map(a => [
        a.member?.student_id || "-",
        a.member?.name || "-",
        a.checked_in_at ? new Date(a.checked_in_at).toLocaleString("id-ID") : "-",
        a.status || "Hadir"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rekap_${selectedMeetingData?.name || 'absensi'}.csv`);
    link.click();
  };

  const getStatusBadge = (attendance) => {
    // Logika status bisa disesuaikan
    if (!attendance.checked_in_at) {
      return { text: "Alpa", bg: "bg-red-100", color: "text-red-700" };
    }
    
    // Cek jika terlambat (contoh: lebih dari 15 menit dari start_time)
    const meeting = meetings.find(m => m.id === selectedMeeting);
    if (meeting && meeting.start_time) {
      const startTime = new Date(meeting.start_time);
      const checkInTime = new Date(attendance.checked_in_at);
      const diff = (checkInTime - startTime) / (1000 * 60); // dalam menit
      
      if (diff > 15) {
        return { text: "Terlambat", bg: "bg-yellow-100", color: "text-yellow-700" };
      }
    }
    
    return { text: "Hadir", bg: "bg-green-100", color: "text-green-700" };
  };

  const selectedMeetingData = meetings.find(m => m.id === selectedMeeting);

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Filter Rekap Absensi</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Praktikum</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
              disabled={loading}
            >
              <option value="">Semua Praktikum</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
              disabled={loading}
            >
              <option value="">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Kelas {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Pertemuan</label>
            <select
              value={selectedMeeting || ""}
              onChange={(e) => setSelectedMeeting(Number(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
              disabled={loading || filteredMeetings.length === 0}
            >
              {filteredMeetings.length === 0 ? (
                <option value="">
                  {selectedCourse && selectedClass 
                    ? "Belum ada pertemuan untuk kelas ini"
                    : "Pilih praktikum dan kelas terlebih dahulu"}
                </option>
              ) : (
                filteredMeetings.map((meeting) => (
                  <option key={meeting.id} value={meeting.id}>
                    Pertemuan {meeting.meeting_number} - {meeting.course_name || meeting.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={handleTerapkan}
            disabled={!selectedMeeting || loading || filteredMeetings.length === 0}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Terapkan
          </button>
        </div>
        
        {/* Info message when no meetings available */}
        {!loading && filteredMeetings.length === 0 && selectedCourse && selectedClass && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              💡 <strong>Belum ada pertemuan yang dibuat untuk kombinasi praktikum dan kelas ini.</strong>
              <br />
              Silakan buat pertemuan terlebih dahulu di menu "Kelola Sesi" sebelum melihat rekap absensi.
            </p>
          </div>
        )}
      </div>

      {/* Hasil Rekap Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">Hasil Rekap</h3>
            {selectedMeetingData && (
              <p className="text-lg text-slate-600">
                {selectedMeetingData.name}, Pertemuan {selectedMeetingData.meeting_number}
              </p>
            )}
          </div>
          
          <button
            onClick={handleExportCSV}
            disabled={attendances.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Ekspor Ke CSV
          </button>
        </div>

        {/* Table */}
        {loadingRekap ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Memuat data...</p>
          </div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {selectedMeeting ? "Belum ada data absensi. Klik tombol Terapkan untuk memuat data." : "Pilih pertemuan terlebih dahulu"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-500 uppercase">NPM</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-500 uppercase">NAMA</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-500 uppercase">WAKTU SCAN</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-500 uppercase">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((attendance, idx) => {
                  const status = getStatusBadge(attendance);
                  return (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 text-base">
                        {attendance.member?.student_id || "-"}
                      </td>
                      <td className="py-4 px-4 text-base">
                        {attendance.member?.name || "-"}
                      </td>
                      <td className="py-4 px-4 text-base">
                        {attendance.checked_in_at 
                          ? new Date(attendance.checked_in_at).toLocaleString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              timeZone: "Asia/Jakarta"
                            }) + " WIB"
                          : "_"}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-4 py-1 rounded ${status.bg} ${status.color} font-medium`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}