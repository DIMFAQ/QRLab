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
    member_ids: [], // Multiple mahasiswa
    course_ids: [], // Multiple praktikum
    class_ids: [], // Multiple kelas
    is_active: true
  });
  
  // Filter states
  const [filterCourse, setFilterCourse] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterMember, setFilterMember] = useState('');

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
    
    if (formData.member_ids.length === 0) {
      alert('Pilih minimal 1 mahasiswa!');
      return;
    }
    
    if (formData.course_ids.length === 0) {
      alert('Pilih minimal 1 praktikum!');
      return;
    }
    
    if (formData.class_ids.length === 0) {
      alert('Pilih minimal 1 kelas!');
      return;
    }
    
    const totalEnrollments = formData.member_ids.length * formData.course_ids.length * formData.class_ids.length;
    
    if (!confirm(`Akan membuat ${totalEnrollments} enrollment:\n- ${formData.member_ids.length} mahasiswa\n- ${formData.course_ids.length} praktikum\n- ${formData.class_ids.length} kelas\n\nLanjutkan?`)) {
      return;
    }
    
    try {
      // Bulk create enrollments (many-to-many-to-many)
      const response = await api.post('/admin/enrollments/bulk-advanced', {
        member_ids: formData.member_ids,
        course_ids: formData.course_ids,
        class_ids: formData.class_ids,
        is_active: formData.is_active
      });
      
      alert(response.data.message || `Berhasil membuat ${response.data.created} enrollment!`);
      setShowAddModal(false);
      setFormData({
        member_ids: [],
        course_ids: [],
        class_ids: [],
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

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/enrollments/${id}`, {
        is_active: !currentStatus
      });
      // Update local state
      setEnrollments(enrollments.map(enrollment => 
        enrollment.id === id 
          ? { ...enrollment, is_active: !currentStatus }
          : enrollment
      ));
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      alert('Gagal mengubah status: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Filter enrollments based on selected filters
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchCourse = !filterCourse || enrollment.course_id === parseInt(filterCourse);
    const matchClass = !filterClass || enrollment.class_id === parseInt(filterClass);
    const matchMember = !filterMember || 
      enrollment.member?.name?.toLowerCase().includes(filterMember.toLowerCase()) ||
      enrollment.member?.student_id?.toLowerCase().includes(filterMember.toLowerCase());
    
    return matchCourse && matchClass && matchMember;
  });

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Filter Data</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#076BB2] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition"
          >
            + Tambah Enrollment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Filter Praktikum</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Praktikum</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Filter Kelas</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kelas</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Cari Mahasiswa</label>
            <input
              type="text"
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              placeholder="Nama atau NIM..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {(filterCourse || filterClass || filterMember) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-slate-600">
              Menampilkan {filteredEnrollments.length} dari {enrollments.length} enrollment
            </span>
            <button
              onClick={() => {
                setFilterCourse('');
                setFilterClass('');
                setFilterMember('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Tambah Enrollment Massal</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Pilih Mahasiswa (bisa lebih dari 1)
                </label>
                <div className="border rounded p-3 max-h-60 overflow-y-auto bg-gray-50">
                  <div className="mb-2">
                    <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.member_ids.length === members.length && members.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, member_ids: members.map(m => m.id)});
                          } else {
                            setFormData({...formData, member_ids: []});
                          }
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="font-semibold text-blue-600">Pilih Semua ({members.length})</span>
                    </label>
                  </div>
                  <hr className="my-2" />
                  {members.map(member => (
                    <label key={member.id} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.member_ids.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, member_ids: [...formData.member_ids, member.id]});
                          } else {
                            setFormData({...formData, member_ids: formData.member_ids.filter(id => id !== member.id)});
                          }
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="text-sm">
                        <span className="font-semibold">{member.student_id}</span> - {member.name}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Terpilih: {formData.member_ids.length} mahasiswa
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Pilih Praktikum (bisa lebih dari 1)
                </label>
                <div className="border rounded p-3 max-h-60 overflow-y-auto bg-gray-50">
                  <div className="mb-2">
                    <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.course_ids.length === courses.length && courses.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, course_ids: courses.map(c => c.id)});
                          } else {
                            setFormData({...formData, course_ids: []});
                          }
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="font-semibold text-blue-600">Pilih Semua ({courses.length})</span>
                    </label>
                  </div>
                  <hr className="my-2" />
                  {courses.map(course => (
                    <label key={course.id} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.course_ids.includes(course.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, course_ids: [...formData.course_ids, course.id]});
                          } else {
                            setFormData({...formData, course_ids: formData.course_ids.filter(id => id !== course.id)});
                          }
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="text-sm">
                        <span className="font-semibold">{course.code}</span> - {course.name}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Terpilih: {formData.course_ids.length} praktikum
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Pilih Kelas (bisa lebih dari 1)
                </label>
                <div className="border rounded p-3 max-h-60 overflow-y-auto bg-gray-50">
                  <div className="mb-2">
                    <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.class_ids.length === classes.length && classes.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, class_ids: classes.map(c => c.id)});
                          } else {
                            setFormData({...formData, class_ids: []});
                          }
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="font-semibold text-blue-600">Pilih Semua ({classes.length})</span>
                    </label>
                  </div>
                  <hr className="my-2" />
                  {classes.map(cls => (
                    <label key={cls.id} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.class_ids.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, class_ids: [...formData.class_ids, cls.id]});
                          } else {
                            setFormData({...formData, class_ids: formData.class_ids.filter(id => id !== cls.id)});
                          }
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="text-sm">
                        Kelas <span className="font-semibold">{cls.code}</span> - {cls.name}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Terpilih: {formData.class_ids.length} kelas
                </p>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2 w-4 h-4"
                  />
                  <span className="text-gray-700 font-semibold">Aktif</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={formData.member_ids.length === 0 || formData.course_ids.length === 0 || formData.class_ids.length === 0}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Simpan ({formData.member_ids.length}×{formData.course_ids.length}×{formData.class_ids.length} = {formData.member_ids.length * formData.course_ids.length * formData.class_ids.length} enrollment)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      member_ids: [],
                      course_ids: [],
                      class_ids: [],
                      is_active: true
                    });
                  }}
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                NIM
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Nama Mahasiswa
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Praktikum
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredEnrollments.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                  {enrollments.length === 0 
                    ? 'Belum ada enrollment. Klik "Tambah Enrollment" untuk mulai.'
                    : 'Tidak ada data yang sesuai dengan filter.'}
                </td>
              </tr>
            ) : (
              filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {enrollment.member?.student_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {enrollment.member?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {enrollment.course?.code} - {enrollment.course?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {enrollment.praktikum_class?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(enrollment.id, enrollment.is_active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        enrollment.is_active 
                          ? 'bg-green-500 focus:ring-green-500' 
                          : 'bg-red-400 focus:ring-red-400'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enrollment.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(enrollment.id)}
                      className="text-red-600 hover:text-red-800 font-medium transition"
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
