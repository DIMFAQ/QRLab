import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/profile');
      setUser(res.data);
      setCurrentPhoto(res.data.profile_photo);
      setLoading(false);
    } catch (error) {
      console.error('Load profile error:', error);
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }

    // Validasi file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB!');
      return;
    }

    setSelectedFile(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Pilih foto terlebih dahulu!');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const res = await api.post('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCurrentPhoto(res.data.profile_photo);
      setSelectedFile(null);
      setPreview(null);
      
      // Notify other components
      window.dispatchEvent(new Event('profilePhotoUpdated'));
      
      alert('Foto profil berhasil disimpan!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload gagal!');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleDelete = async () => {
    if (!confirm('Hapus foto profil?')) return;

    setUploading(true);
    try {
      await api.delete('/profile/photo');
      setCurrentPhoto(null);
      setSelectedFile(null);
      setPreview(null);
      
      // Notify other components
      window.dispatchEvent(new Event('profilePhotoUpdated'));
      
      alert('Foto profil berhasil dihapus');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Hapus gagal!');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
        <div className="text-gray-900 text-xl">Loading...</div>
      </div>
    );
  }

  const displayPhoto = preview || currentPhoto;

  return (
    <div className="min-h-screen bg-[#F5F6FA] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Edit Profil</h1>
            <p className="text-slate-600 mt-1">Kelola informasi dan foto profil Anda</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-white rounded-lg border border-slate-300 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri - Foto Profil */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Foto Profil</h2>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#076BB2] shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-300">
                    <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-lg transition w-full text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                Pilih Foto
              </label>

              {selectedFile && (
                <p className="text-sm text-slate-600 text-center break-all">
                  {selectedFile.name}
                </p>
              )}

              {selectedFile ? (
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-[#076BB2] hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-lg transition"
                  >
                    {uploading ? 'Menyimpan...' : 'Simpan Foto'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={uploading}
                    className="w-full bg-slate-500 hover:bg-slate-600 disabled:bg-slate-400 text-white font-semibold py-2.5 px-4 rounded-lg transition"
                  >
                    Batal
                  </button>
                </div>
              ) : currentPhoto ? (
                <button
                  onClick={handleDelete}
                  disabled={uploading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 px-4 rounded-lg transition"
                >
                  Hapus Foto
                </button>
              ) : null}

              <p className="text-xs text-slate-500 text-center">
                Format: JPG, JPEG, PNG<br />Maksimal 2MB
              </p>
            </div>
          </div>

          {/* Kolom Kanan - Informasi Akun */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Informasi Akun</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Nama Lengkap</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
                  {user.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Role</label>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                      : 'bg-blue-100 text-blue-700 border border-blue-300'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Praktikan'}
                  </span>
                </div>
              </div>

              {user.member && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">NPM</label>
                  <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
                    {user.member.student_id}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  <strong>Catatan:</strong> Untuk mengubah nama, email, atau NPM, silakan hubungi administrator sistem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
