import { useNavigate } from 'react-router-dom';

// Komponen Ikon QR
const QRIcon = () => (
  <div className="w-16 h-16 bg-[#076BB2] rounded-2xl shadow-lg p-3 grid grid-cols-2 gap-[5px]">
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
    <div className="w-full h-full border-[4px] border-[#E9E9E9] rounded-sm"></div>
  </div>
);

export default function ResetSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E9E9E9] p-4 font-arimo">
      <div className="w-full max-w-sm">
        
        {/* Logo dan Judul */}
        <div className="flex flex-col items-center mb-4">
          <QRIcon />
          <h1 
            className="text-5xl text-black font-arya mt-4" 
            style={{ textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
          >
            QR-Lab
          </h1>
          <p className="text-base text-gray-900 mt-1">
            Sistem Presensi Digital
          </p>
        </div>

        {/* Kartu Success */}
        <div 
          className="bg-white rounded-2xl p-7" 
          style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.30)' }}
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-[#076BB2] flex items-center justify-center shadow-lg">
              <svg 
                className="w-12 h-12 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-center text-gray-900 mb-5">
            Password Berhasil Diubah!
          </h2>

          {/* Button */}
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#076BB2] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-blue-800 transition duration-300"
          >
            Kembali ke Login
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-900 mt-12">
          © 2025 QR-Lab Unila | Fakultas Teknik
        </div>
      </div>
    </div>
  );
}
