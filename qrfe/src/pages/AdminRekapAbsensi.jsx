import React, { useState, useEffect } from 'react';
import api from '../api';

// Komponen helper untuk status pill
const StatusPill = ({ status }) => {
  switch (status) {
    case 'Hadir':
      return <div className="w-full text-center py-1.5 rounded-lg bg-[rgba(107,210,130,0.79)] text-[#1A5728] text-sm font-medium">Hadir</div>;
    case 'Terlambat':
      return <div className="w-full text-center py-1.5 rounded-lg bg-[rgba(255,234,0,0.45)] text-[#885800] text-sm font-medium">Terlambat</div>;
    case 'Alpa':
      return <div className="w-full text-center py-1.5 rounded-lg bg-[rgba(246,12,12,0.45)] text-[#930B0B] text-sm font-medium">Alpa</div>;
    default:
      return <div className="w-full text-center py-1.5 rounded-lg bg-gray-200 text-gray-800 text-sm font-medium">Unknown</div>;
  }
};

export default function AdminRekapAbsensi() {
  // State untuk data filter
  const [meetingNames, setMeetingNames] = useState([]); // Daftar nama matkul
  const [meetingNumbers, setMeetingNumbers] = useState([]); // Daftar nomor pertemuan

  // State untuk pilihan filter
  const [selectedName, setSelectedName] = useState('');
  const [selectedNumber, setSelectedNumber] = useState('');

  // State untuk hasil
  const [rekapData, setRekapData] = useState([]);
  const [resultTitle, setResultTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch daftar nama meeting unik (Matkul) saat komponen dimuat
  useEffect(() => {
    const fetchMeetingNames = async () => {
      try {
        // Endpoint BARU (lihat bagian Backend)
        const { data } = await api.get('/admin/rekap/meeting-names'); 
        setMeetingNames(data);
        if (data.length > 0) {
          setSelectedName(data[0]); // Set default ke matkul pertama
        }
      } catch (e) {
        setError('Gagal memuat daftar mata kuliah.');
      }
    };
    fetchMeetingNames();
  }, []);

  // 2. Fetch daftar nomor pertemuan setiap kali nama matkul berubah
  useEffect(() => {
    if (!selectedName) {
      setMeetingNumbers([]);
      setSelectedNumber('');
      return;
    }
    const fetchMeetingNumbers = async () => {
      try {
        // Endpoint BARU (lihat bagian Backend)
        const { data } = await api.get(`/admin/rekap/meeting-numbers?name=${selectedName}`);
        setMeetingNumbers(data);
        if (data.length > 0) {
          setSelectedNumber(data[0]); // Set default ke nomor pertama
        } else {
          setSelectedNumber('');
        }
      } catch (e) {
        setError('Gagal memuat nomor pertemuan.');
      }
    };
    fetchMeetingNumbers();
  }, [selectedName]); // Dependensi: selectedName

  // 3. Fungsi untuk tombol "Terapkan"
  const handleFilterApply = async () => {
    if (!selectedName || !selectedNumber) {
      setError('Silakan pilih Mata Kuliah dan Judul Ke-');
      return;
    }
    setLoading(true);
    setError('');
    setRekapData([]);
    
    try {
      // Endpoint BARU (lihat bagian Backend)
      const { data } = await api.get(`/admin/rekap/filter?name=${selectedName}&number=${selectedNumber}`);
      setRekapData(data);
      setResultTitle(`${selectedName}, Judul ${selectedNumber}`);
    } catch (e) {
      setError('Gagal mengambil data rekap.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fungsi untuk Ekspor CSV
  const handleExportCSV = () => {
    if (rekapData.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    
    // Buat header
    const headers = ['NPM', 'Nama', 'Waktu Scan', 'Status'];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    // Buat baris data
    rekapData.forEach(row => {
      const line = [row.npm, `"${row.name}"`, `"${row.scan_time || '-'}"`, row.status];
      csvContent += line.join(",") + "\n";
    });

    // Buat link download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekap_${selectedName}_${selectedNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Filter Box */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-['Arimo'] font-bold text-center mb-6">Filter Rekap Absensi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Dropdown Mata Kuliah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Praktikum</label>
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              {meetingNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          
          {/* Dropdown Judul Ke- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Ke-</label>
            <select
              value={selectedNumber}
              onChange={(e) => setSelectedNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              disabled={meetingNumbers.length === 0}
            >
              {meetingNumbers.length === 0 && <option>Pilih Matkul Dulu</option>}
              {meetingNumbers.map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Tombol Terapkan */}
          <button
            onClick={handleFilterApply}
            disabled={loading}
            className="w-full bg-[#076BB2] text-white font-bold p-3 rounded-lg"
          >
            {loading ? 'Memuat...' : 'Terapkan'}
          </button>
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>

      {/* 2. Hasil Rekap */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-['Arimo'] font-bold">Hasil Rekap</h3>
          <button 
            onClick={handleExportCSV}
            className="bg-[#00A94C] text-white font-bold px-4 py-2 rounded-lg"
          >
            Ekspor ke CSV
          </button>
        </div>
        <h4 className="text-lg font-['Arimo'] text-gray-700 mb-4">{resultTitle || 'Silakan terapkan filter di atas.'}</h4>

        {/* Tabel Hasil */}
        <div className="divide-y divide-gray-200">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50">
            <div className="text-[#717182] text-sm font-bold">NPM</div>
            <div className="text-[#717182] text-sm font-bold">NAMA</div>
            <div className="text-[#717182] text-sm font-bold">WAKTU SCAN</div>
            <div className="text-[#717182] text-sm font-bold text-center">STATUS</div>
          </div>
          
          {/* Table Body */}
          {loading && <div className="p-4 text-center">Memuat data...</div>}
          {!loading && rekapData.length === 0 && !resultTitle && (
            <div className="p-4 text-center text-gray-500"></div>
          )}
          {!loading && rekapData.length === 0 && resultTitle && (
            <div className="p-4 text-center text-gray-500">Data tidak ditemukan.</div>
          )}

          {!loading && rekapData.map((row, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 px-4 py-4 items-center">
              <div className="text-black font-medium">{row.npm}</div>
              <div className="text-black">{row.name}</div>
              <div className="text-black text-sm">{row.scan_time || '—'}</div>
              <div className="text-black"><StatusPill status={row.status} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}