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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const displayPhoto = preview || currentPhoto;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-gray-200 flex items-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Edit Profil</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Photo Section */}
          <div className="border-b pb-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Foto Profil
            </h2>
            
            {/* Photo Display */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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

              {/* File Input */}
              <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200">
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
                <p className="text-sm text-gray-600">
                  File dipilih: <span className="font-semibold">{selectedFile.name}</span>
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 w-full max-w-sm">
                {selectedFile ? (
                  <>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                    >
                      {uploading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={uploading}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                    >
                      Batal
                    </button>
                  </>
                ) : currentPhoto ? (
                  <button
                    onClick={handleDelete}
                    disabled={uploading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Hapus Foto
                  </button>
                ) : null}
              </div>

              <p className="text-xs text-gray-500">
                Format: JPG, JPEG, PNG. Maksimal 2MB
              </p>
            </div>
          </div>

          {/* Info Section - Read Only */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informasi Akun
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nama</label>
                <p className="mt-1 text-gray-900 font-semibold">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-gray-900 font-semibold">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Role</label>
                <p className="mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'Praktikan'}
                  </span>
                </p>
              </div>
              {user.member && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">NPM</label>
                  <p className="mt-1 text-gray-900 font-semibold">{user.member.student_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
