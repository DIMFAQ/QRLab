// Isi BARU untuk: qrfe/src/pages/PraktikanDashboard.jsx

import React, { useState } from "react";
// DIUBAH: Impor 'useNavigate' untuk fungsi logout
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
// DIUBAH: Impor 'QrScanner' sebagai default (menghapus {})
import QrScanner from "../components/QrScanner";

// Impor ikon-ikon
import { Logout2 } from "../components/Logout2";
import { Menu } from "../components/Menu";
import { Restore } from "../components/Restore";
import { Scan } from "../components/Scan";
import image3 from "../assets/image-3.png"; // Ini adalah Logo Universitas
import image from "../assets/image.png";   // Ini adalah Foto Profil

// DIUBAH: Terima 'user' sebagai prop dari App.jsx
export const PraktikanDashboard = ({ user }) => {
    // DIHAPUS: useState untuk user dan error (karena sudah didapat dari props)
    const [showScanner, setShowScanner] = useState(false);
    const navigate = useNavigate(); // DITAMBAH: Untuk fungsi logout

    // DIHAPUS: useEffect untuk api.get('/user') (karena sudah di App.jsx)

    const handleScanClick = () => {
        setShowScanner(prev => !prev);
    };

    // DITAMBAH: Fungsi logout baru untuk tombol sidebar
    const handleLogout = async () => {
        try { 
            await api.post('/logout'); 
        } catch (e) {
            console.error("Gagal logout di API, tapi tetap lanjut logout di frontend");
        }
        localStorage.removeItem('authToken');
        navigate('/login'); // Arahkan kembali ke halaman login
        window.location.reload(); // Paksa reload untuk membersihkan state di App.jsx
    };

    // DIHAPUS: Pengecekan 'loading' dan 'error' (karena sudah di App.jsx)

    return (
        // DIUBAH: Hapus 'min-h-[896px]' agar lebih fleksibel
        <div className="bg-[#e9e9e9] overflow-hidden w-full min-w-[414px] relative">
            
            {/* ================================== */}
            {/* Top Bar (dari Figma) - INI TETAP ADA */}
            {/* ================================== */}
            <div className="absolute top-0 left-0 w-[414px] h-[68px] bg-[#076bb2]" />
            <Menu className="!absolute !top-5 !left-[15px] !w-[30px] !h-[30px]" />

            <Link to="/profil">
                <img
                    className="top-5 left-[367px] absolute w-[30px] h-[30px] object-cover rounded-full"
                    alt="Foto Profil"
                    src={image} // Menggunakan image.png
                />
            </Link>
            
            {/* ================================== */}
            {/* Sidebar (dari Figma)        */}
            {/* ================================== */}
            
            {/* Elemen sidebar (warna teks diubah jadi hitam) */}
            <div className="w-[416px] h-[25px] top-[34px] left-[-86px] flex items-start absolute">
                <div className="relative flex-1 mt-[-1.00px] [font-family:'Arimo-Regular',Helvetica] font-normal text-black text-xs text-center tracking-[0] leading-6">
                    Sistem Presensi Digital
                </div>
            </div>
            
            {/* Link Dashboard */}
            <Link to="/praktikan" className="w-[416px] h-[25px] top-[140px] left-[-117px] flex items-start absolute">
                <div className="relative flex-1 mt-[-1.00px] [font-family:'Arimo-Regular',Helvetica] font-normal text-black text-xs text-center tracking-[0] leading-6">
                    Dashboard
                </div>
            </Link>
            <Scan
                className="!absolute !top-[140px] !left-[26px] !w-6 !h-6 !aspect-[1]"
                color="black"
            />
            
            {/* DIUBAH: "Riwayat Presensi" sekarang menjadi Link */}
            <Link to="/riwayat" className="w-[177px] h-[21px] top-[182px] left-4 flex items-start absolute">
                <div className="relative w-[180px] mt-[-1.00px] mb-[-2.00px] mr-[-3.00px] [font-family:'Arimo-Regular',Helvetica] font-normal text-neutral-950 text-xs text-center tracking-[0] leading-6">
                    Riwayat Presensi
                </div>
            </Link>
            <Restore className="!absolute !top-[182px] !left-[26px] !w-6 !h-6 !aspect-[1]" />
            
            {/* DIUBAH: "Logout" sekarang menjadi tombol fungsional */}
            <div onClick={handleLogout} className="w-[180px] h-6 top-[219px] -left-2.5 flex items-start absolute cursor-pointer">
                <div className="relative w-[180px] mt-[-1.00px] [font-family:'Arimo-Regular',Helvetica] font-normal text-neutral-950 text-xs text-center tracking-[0] leading-6">
                    Logout
                </div>
            </div>
            <Logout2 className="!absolute !top-[217px] !left-[22px] !w-[27px] !h-[27px] !aspect-[1]" />
            
            <img
                className="top-[19px] left-[19px] aspect-[1.02] absolute w-[30px] h-[30px] object-cover"
                alt="Logo Universitas"
                src={image3} // Menggunakan image-3.png
            />
            
            {/* ================================== */}
            {/* Konten Utama (Sudah Dinamis)    */}
            {/* ================================== */}
            
            {showScanner ? (
                <div className="absolute top-[195px] left-0 right-0 w-full px-[20px] z-10 flex flex-col items-center">
                    <div className="ml-[calc(271px/2)]">
                        <QrScanner />
                    </div>
                    <button
                        onClick={handleScanClick}
                        className="mt-4 px-4 py-2 bg-red-600 text-white font-bold rounded-[20px] shadow-lg ml-[calc(271px/2)]"
                    >
                        Tutup Scanner
                    </button>
                </div>
            ) : (
                <>
                    {/* DIUBAH: Menggunakan 'user.name' dari props */}
                    <div className="absolute top-[195px] left-[67px] [font-family:'Arimo-Bold',Helvetica] font-bold text-black text-[28px] text-center tracking-[0] leading-6 whitespace-nowrap">
                        Selamat Datang, {user.name}
                    </div>

                    <div
                        className="absolute top-[623px] left-[63px] w-[287px] h-[59px] bg-[#076bb2] rounded-[20px] cursor-pointer"
                        onClick={handleScanClick}
                    />
                    <div
                        className="absolute top-[638px] left-[119px] w-[177px] h-[31px] flex cursor-pointer"
                        onClick={handleScanClick}
                    >
                        <div className="mt-0 w-[175.12px] h-[30.96px] ml-0 [font-family:'Roboto-Regular',Helvetica] font-normal text-[#fdf7f7] text-[26px] tracking-[0] leading-[normal] whitespace-nowrap">
                            Scan QR Code
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PraktikanDashboard;