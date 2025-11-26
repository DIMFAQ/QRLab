import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminKelolaEnrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [members, setMembers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [formData, setFormData] = useState({
    member_ids: [], // Multiple mahasiswa
    course_ids: [], // Multiple praktikum
    class_ids: [] // Multiple kelas
  });
  
  // New course/class form data
  const [newCourse, setNewCourse] = useState({ code: '', name: '' });
  const [newClass, setNewClass] = useState({ code: '', name: '', capacity: 30 });
  
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
        class_ids: formData.class_ids
      });
      
      // Tampilkan hasil detail
      const { created, skipped, errors } = response.data;
      let message = response.data.message || `Berhasil membuat ${created} enrollment!`;
      
      if (skipped > 0) {
        message += `\n\nDilewati: ${skipped} enrollment (sudah terdaftar sebelumnya)`;
        if (errors && errors.length > 0) {
          message += '\n\nDetail yang dilewati:\n' + errors.slice(0, 5).join('\n');
          if (errors.length > 5) {
            message += `\n... dan ${errors.length - 5} lainnya`;
          }
        }
      }
      
      alert(message);
      setShowAddModal(false);
      setFormData({
        member_ids: [],
        course_ids: [],
        class_ids: []
      });
      fetchData();
    } catch (error) {
      console.error('Error creating enrollment:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('Gagal menambahkan enrollment:\n\n' + errorMsg);
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

  const handleAddCourse = async (e) => {
    e.preventDefault();
    
    if (!newCourse.code || !newCourse.name) {
      alert('Kode dan nama praktikum harus diisi!');
      return;
    }
    
    try {
      await api.post('/admin/courses', newCourse);
      alert('Praktikum berhasil ditambahkan!');
      setShowAddCourseModal(false);
      setNewCourse({ code: '', name: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Gagal menambahkan praktikum: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    
    if (!newClass.code || !newClass.name) {
      alert('Kode dan nama kelas harus diisi!');
      return;
    }
    
    try {
      await api.post('/admin/classes', newClass);
      alert('Kelas berhasil ditambahkan!');
      setShowAddClassModal(false);
      setNewClass({ code: '', name: '', capacity: 30 });
      fetchData();
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Gagal menambahkan kelas: ' + (error.response?.data?.message || error.message));
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md transition text-sm"
            >
              + Praktikum
            </button>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md transition text-sm"
            >
              + Kelas
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#076BB2] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition"
            >
              + Tambah Enrollment
            </button>
          </div>
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
            
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Validasi Otomatis</p>
                  <p>Sistem akan otomatis melewati enrollment dengan kombinasi <strong>Mahasiswa + Praktikum + Kelas</strong> yang sudah terdaftar sebelumnya.</p>
                </div>
              </div>
            </div>
            
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
                      class_ids: []
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
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredEnrollments.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
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

      {/* Modal Tambah Praktikum */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Tambah Praktikum Baru</h2>
            <form onSubmit={handleAddCourse}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Kode Praktikum <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                  placeholder="Contoh: IF101"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Nama Praktikum <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  placeholder="Contoh: Pemrograman Web"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex-1 font-semibold"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCourseModal(false);
                    setNewCourse({ code: '', name: '' });
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

      {/* Modal Tambah Kelas */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Tambah Kelas Baru</h2>
            <form onSubmit={handleAddClass}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Kode Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClass.code}
                  onChange={(e) => setNewClass({...newClass, code: e.target.value})}
                  placeholder="Contoh: A"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Nama Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  placeholder="Contoh: Kelas A"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Kapasitas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newClass.capacity}
                  onChange={(e) => setNewClass({...newClass, capacity: parseInt(e.target.value)})}
                  placeholder="Contoh: 30"
                  min="1"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex-1 font-semibold"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddClassModal(false);
                    setNewClass({ code: '', name: '', capacity: 30 });
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
    </div>
  );
}
