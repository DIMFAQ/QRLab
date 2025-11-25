import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminKelolaEnrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [members, setMembers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    course_id: '',
    class_id: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollRes, memberRes, courseRes, classRes] = await Promise.all([
        api.get('/admin/enrollments'),
        api.get('/admin/users'),
        api.get('/admin/courses'),
        api.get('/admin/classes')
      ]);
      
      console.log('Enrollments:', enrollRes.data);
      console.log('Members:', memberRes.data);
      console.log('Courses:', courseRes.data);
      console.log('Classes:', classRes.data);
      
      setEnrollments(enrollRes.data || []);
      setMembers(memberRes.data || []);
      setCourses(courseRes.data || []);
      setClasses(classRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal memuat data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/admin/enrollments', formData);
      alert('Enrollment berhasil ditambahkan!');
      setShowAddModal(false);
      setFormData({
        member_id: '',
        course_id: '',
        class_id: '',
        is_active: true
      });
      fetchData();
    } catch (error) {
      console.error('Error creating enrollment:', error);
      alert('Gagal menambahkan enrollment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus enrollment ini?')) return;
    
    try {
      await api.delete(`/admin/enrollments/${id}`);
      alert('Enrollment berhasil dihapus!');
      fetchData();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      alert('Gagal menghapus enrollment: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kelola Enrollment Mahasiswa</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Tambah Enrollment
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Tambah Enrollment</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Mahasiswa</label>
                <select
                  value={formData.member_id}
                  onChange={(e) => setFormData({...formData, member_id: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">-- Pilih Mahasiswa --</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.student_id} - {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Praktikum</label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">-- Pilih Praktikum --</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Kelas</label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      Kelas {cls.code} - {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Aktif</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex-1"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrollments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NIM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Mahasiswa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Praktikum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Belum ada enrollment. Klik "Tambah Enrollment" untuk mulai.
                </td>
              </tr>
            ) : (
              enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {enrollment.member?.student_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {enrollment.member?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {enrollment.course?.code} - {enrollment.course?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Kelas {enrollment.praktikum_class?.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      enrollment.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {enrollment.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(enrollment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
