import React, { useState, useEffect } from 'react';
import api from '../api';

export default function MeetingForm({ onMeetingCreated, activeQr }) {
  // Helper function to get Jakarta time in datetime-local format
  const getJakartaTime = (addHours = 0) => {
    const now = new Date();
    // Add GMT+7 offset (7 hours = 25200000 ms) and additional hours if specified
    const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000) + (addHours * 60 * 60 * 1000));
    // Format: YYYY-MM-DDTHH:mm
    const year = jakartaTime.getUTCFullYear();
    const month = String(jakartaTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jakartaTime.getUTCDate()).padStart(2, '0');
    const hours = String(jakartaTime.getUTCHours()).padStart(2, '0');
    const minutes = String(jakartaTime.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    course_id: '',
    class_id: '',
    meeting_number: 1,
    qr_duration_minutes: 5,
    start_time: getJakartaTime(0),
    end_time: getJakartaTime(1),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Fetch courses and classes on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [coursesRes, classesRes] = await Promise.all([
          api.get('/admin/courses'),
          api.get('/admin/classes'),
        ]);
        setCourses(coursesRes.data);
        setClasses(classesRes.data);
        
        // Set default values to first option
        if (coursesRes.data.length > 0 && classesRes.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            course_id: coursesRes.data[0].id,
            class_id: classesRes.data[0].id,
          }));
        }
      } catch (err) {
        console.error('Failed to load courses/classes:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const onChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (activeQr) return alert('Tutup dulu sesi yang sedang aktif.');
    setLoading(true);
    setError('');

    const payload = {
      course_id: Number(formData.course_id),
      class_id: Number(formData.class_id),
      meeting_number: Number(formData.meeting_number), 
      qr_duration_minutes: Number(formData.qr_duration_minutes),
      start_time: formData.start_time,
      end_time: formData.end_time,
    };

    try {
      const { data } = await api.post('/admin/meetings', payload); 
      onMeetingCreated?.(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal membuat pertemuan.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  if (loadingOptions) {
    return <div className="text-center py-4 text-slate-500">Memuat data...</div>;
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Praktikum</label>
        <select
          name="course_id"
          value={formData.course_id}
          onChange={onChange}
          required
          className={inputClass}
        >
          <option value="">-- Pilih Praktikum --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Kelas</label>
        <select
          name="class_id"
          value={formData.class_id}
          onChange={onChange}
          required
          className={inputClass}
        >
          <option value="">-- Pilih Kelas --</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              Kelas {cls.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Pertemuan Ke-</label>
        <input
          type="number"
          name="meeting_number"
          value={formData.meeting_number}
          onChange={onChange}
          min={1}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Durasi QR (menit)</label>
        <input
          type="number"
          name="qr_duration_minutes"
          value={formData.qr_duration_minutes}
          onChange={onChange}
          min={1}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Waktu Mulai</label>
        <input
          type="datetime-local"
          name="start_time"
          value={formData.start_time}
          onChange={onChange}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Waktu Selesai</label>
        <input
          type="datetime-local"
          name="end_time"
          value={formData.end_time}
          onChange={onChange}
          required
          className={inputClass}
        />
      </div>

      {error && (
        <p className="sm:col-span-2 text-sm text-red-600 rounded-md bg-red-50 border border-red-200 p-2">
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={loading || !!activeQr}
          className="w-full rounded-xl bg-blue-600 py-2.5 text-white font-semibold shadow hover:bg-blue-700 active:scale-[.98] disabled:bg-slate-400 transition"
        >
          {loading ? 'Membuat Sesi…' : activeQr ? 'Sesi Aktif' : 'Buat & Generate QR'}
        </button>
      </div>
    </form>
  );
}
