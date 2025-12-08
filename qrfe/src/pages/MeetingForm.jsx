import React, { useState, useEffect } from 'react';
import api from '../api';

export default function MeetingForm({ onMeetingCreated, activeQr }) {
  // Format initial time in local timezone
  const now = new Date();
  const formatLocalDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const initialStartTime = formatLocalDateTime(now);
  const initialEndTime = formatLocalDateTime(new Date(now.getTime() + 5 * 60000));

  const [formData, setFormData] = useState({
    course_id: '',
    class_id: '',
    name: '',
    meeting_number: 1,
    qr_duration_minutes: 5,
    start_time: initialStartTime,
    end_time: initialEndTime,
  });
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchClasses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      setCourses(response.data || []);
    } catch (err) {
      console.error('Gagal memuat courses:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/admin/classes');
      setClasses(response.data || []);
    } catch (err) {
      console.error('Gagal memuat classes:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    // Auto-calculate end_time berdasarkan start_time + qr_duration_minutes
    if (name === 'start_time' || name === 'qr_duration_minutes') {
      const startTime = name === 'start_time' ? value : formData.start_time;
      const duration = name === 'qr_duration_minutes' ? parseInt(value) || 0 : formData.qr_duration_minutes;
      
      if (startTime && duration > 0) {
        // Parse datetime-local value (already in local timezone)
        const [datePart, timePart] = startTime.split('T');
        if (datePart && timePart) {
          const [year, month, day] = datePart.split('-');
          const [hour, minute] = timePart.split(':');
          
          // Create date in local timezone
          const start = new Date(year, month - 1, day, hour, minute);
          const end = new Date(start.getTime() + duration * 60000);
          
          // Format back to datetime-local format
          const endYear = end.getFullYear();
          const endMonth = String(end.getMonth() + 1).padStart(2, '0');
          const endDay = String(end.getDate()).padStart(2, '0');
          const endHour = String(end.getHours()).padStart(2, '0');
          const endMinute = String(end.getMinutes()).padStart(2, '0');
          
          updatedFormData.end_time = `${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}`;
        }
      }
    }

    // Auto-generate nama meeting
    if (name === 'course_id' || name === 'class_id') {
      const courseId = name === 'course_id' ? value : formData.course_id;
      const classId = name === 'class_id' ? value : formData.class_id;
      
      const selectedCourse = courses.find(c => c.id == courseId);
      const selectedClass = classes.find(c => c.id == classId);
      
      if (selectedCourse && selectedClass) {
        updatedFormData.name = `${selectedCourse.name} - Kelas ${selectedClass.code}`;
      }
    }
    
    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi course_id dan class_id harus dipilih
    if (!formData.course_id || !formData.class_id) {
      setError('Harap pilih praktikum dan kelas terlebih dahulu.');
      return;
    }
    
    if (activeQr) {
      alert('Harap tutup sesi yang aktif terlebih dahulu.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Pastikan semua data terkirim dengan benar
      const payload = {
        course_id: parseInt(formData.course_id),
        class_id: parseInt(formData.class_id),
        meeting_number: parseInt(formData.meeting_number),
        qr_duration_minutes: parseInt(formData.qr_duration_minutes),
        start_time: formData.start_time,
        end_time: formData.end_time,
      };
      
      const response = await api.post('/admin/meetings', payload);
      
      // Reset form setelah berhasil
      const newNow = new Date();
      setFormData({
        course_id: '',
        class_id: '',
        name: '',
        meeting_number: 1,
        qr_duration_minutes: 5,
        start_time: formatLocalDateTime(newNow),
        end_time: formatLocalDateTime(new Date(newNow.getTime() + 5 * 60000)),
      });
      
      onMeetingCreated(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pertemuan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Praktikum</label>
          <select
            name="course_id"
            value={formData.course_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">-- Pilih Praktikum --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Kelas</label>
          <select
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">-- Pilih Kelas --</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                Kelas {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Pertemuan Ke-</label>
          <input
            type="number"
            name="meeting_number"
            value={formData.meeting_number}
            onChange={handleChange}
            required
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Durasi QR (menit)</label>
          <input
            type="number"
            name="qr_duration_minutes"
            value={formData.qr_duration_minutes}
            onChange={handleChange}
            required
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Mulai</label>
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Selesai</label>
          <input
            type="text"
            name="end_time"
            value={formData.end_time ? (() => {
              try {
                // Parse datetime-local format (YYYY-MM-DDTHH:mm)
                const [datePart, timePart] = formData.end_time.split('T');
                if (!datePart || !timePart) return '';
                
                const [year, month, day] = datePart.split('-');
                const [hour, minute] = timePart.split(':');
                
                return `${day}/${month}/${year.slice(-2)} ${hour}.${minute}`;
              } catch (e) {
                console.error('Error formatting end_time:', e);
                return '';
              }
            })() : ''}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-600 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1.5 italic">Dihitung dari waktu mulai + durasi QR</p>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || activeQr}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:bg-gray-400 transition"
      >
        {loading
          ? 'Membuat Sesi...'
          : activeQr
          ? 'Sesi Aktif'
          : 'Buat & Jadwalkan Sesi'}
      </button>
    </form>
  );
}
