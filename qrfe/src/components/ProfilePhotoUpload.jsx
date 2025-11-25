import React, { useState, useEffect } from 'react';
import api from '../api';

const ProfilePhotoUpload = ({ onPhotoChange }) => {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.profile_photo) {
        setPhotoUrl(res.data.profile_photo);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleFileSelect = async (e) => {
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

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await api.post('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPhotoUrl(res.data.profile_photo);
      setPreview(null);
      if (onPhotoChange) onPhotoChange(res.data.profile_photo);
      
      // Notify other components
      window.dispatchEvent(new Event('profilePhotoUpdated'));
      
      alert('Foto profil berhasil diupload!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload gagal!');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Hapus foto profil?')) return;

    try {
      await api.delete('/profile/photo');
      setPhotoUrl(null);
      setPreview(null);
      if (onPhotoChange) onPhotoChange(null);
      
      // Notify other components
      window.dispatchEvent(new Event('profilePhotoUpdated'));
      
      alert('Foto profil berhasil dihapus');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Hapus gagal!');
    }
  };

  const displayPhoto = preview || photoUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Photo Display */}
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

      {/* Buttons */}
      <div className="flex space-x-2">
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          {photoUrl ? 'Ganti Foto' : 'Upload Foto'}
        </label>
        
        {photoUrl && (
          <button
            onClick={handleDelete}
            disabled={uploading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Hapus
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Format: JPG, JPEG, PNG. Maksimal 2MB
      </p>
    </div>
  );
};

export default ProfilePhotoUpload;
