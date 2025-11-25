import axios from 'axios';

// ============================================
// KONFIGURASI NGROK (Update URL ini setiap kali ngrok restart)
// ============================================
// Ganti dengan backend ngrok URL Anda dari Terminal 3
// Contoh: 'https://abc123.ngrok-free.app'
// UNTUK DEVELOPMENT LOCAL (tanpa HP): Biarkan kosong atau isi dengan ''
const BACKEND_NGROK_URL = ''; // Kosong = pakai Vite proxy

// Auto-detect environment dan return appropriate base URL
const getBaseURL = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // PENTING: Jika frontend di HTTPS, gunakan Vite proxy (relative URL)
    if (protocol === 'https:') {
        console.log('🔒 HTTPS detected - using Vite proxy for backend');
        
        // Jika ada BACKEND_NGROK_URL yang diset (untuk production), pakai itu
        if (BACKEND_NGROK_URL && BACKEND_NGROK_URL !== '') {
            console.log('   Using ngrok backend:', BACKEND_NGROK_URL);
            return `${BACKEND_NGROK_URL}/api`;
        }
        
        // Development: Pakai Vite proxy (relative path)
        // Request ke /api akan di-proxy ke http://127.0.0.1:8000/api
        console.log('   Using Vite proxy to backend (HTTP → HTTPS upgrade)');
        return '/api';
    }
    
    // 1. Jika akses dari ngrok (HP atau public access)
    if (hostname.includes('ngrok-free.app') || hostname.includes('ngrok-free.dev') || hostname.includes('ngrok.io')) {
        console.log('🌐 Detected Ngrok access');
        
        // Kalau BACKEND_NGROK_URL ada, pakai itu
        if (BACKEND_NGROK_URL && BACKEND_NGROK_URL !== '') {
            console.log('   Using ngrok backend:', BACKEND_NGROK_URL);
            return `${BACKEND_NGROK_URL}/api`;
        }
        
        // Kalau tidak ada, asumsi backend di localhost ngrok tunnel
        // Tapi karena kita ngrok free (1 tunnel), backend tetap di localhost PC
        // Jadi kita kembalikan error yang jelas
        console.warn('⚠️ BACKEND_NGROK_URL kosong.');
        console.warn('   Untuk Ngrok Free (1 tunnel):');
        console.warn('   - Frontend: Ngrok HTTPS (kamera bisa)');
        console.warn('   - Backend: Harus di network yang sama atau pakai ngrok paid');
        
        // Coba pakai lokasi IP host (tidak akan jalan untuk beda network)
        alert('PERINGATAN:\n\nBackend tidak bisa diakses karena Ngrok Free hanya 1 tunnel.\n\nSolusi:\n1. Upgrade Ngrok ke paid ($8/bln)\n2. ATAU pakai WiFi yang sama (backend http://192.168.x.x:8000)\n3. ATAU akses dari PC aja (http://localhost:5173)');
        
        // Return localhost sebagai fallback (akan error tapi jelas)
        return 'http://localhost:8000/api';
    }
    
    // 2. Jika akses dari localhost/127.0.0.1 (development)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('💻 Detected localhost access');
        return 'http://127.0.0.1:8000/api';
    }
    
    // 3. Jika akses dari IP network (192.168.x.x dari HP dalam WiFi sama)
    console.log('📡 Detected network IP access:', hostname);
    // Paksa HTTP untuk backend (Laravel dev server)
    return `http://${hostname.split(':')[0]}:8000/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false, // False untuk Bearer token API (tidak perlu cookies)
    timeout: 30000, // 30 detik timeout
});

// Request interceptor: Attach auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request untuk debugging (hapus di production)
        console.log('📤 API Request:', config.method.toUpperCase(), config.url);
        
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor: Handle errors globally
api.interceptors.response.use(
    (response) => {
        // Log response untuk debugging (hapus di production)
        console.log('📥 API Response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        // Handle ngrok-specific errors
        if (error.response?.status === 503) {
            console.error('❌ Ngrok tunnel mungkin expired atau tidak aktif');
            console.error('   Restart ngrok dan update BACKEND_NGROK_URL di api.js');
        }
        
        // Handle CORS errors
        if (error.message.includes('Network Error') || error.message.includes('CORS')) {
            console.error('❌ CORS Error detected');
            console.error('   Pastikan backend CORS sudah dikonfigurasi untuk:', window.location.origin);
        }
        
        // Handle auth errors
        if (error.response?.status === 401) {
            console.warn('⚠️ Unauthorized - Token mungkin expired');
            // Bisa auto-logout di sini jika perlu
        }
        
        return Promise.reject(error);
    }
);

export default api;