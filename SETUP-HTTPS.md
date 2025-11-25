# Setup HTTPS untuk QR-Lab (Kamera + API)

## Masalah yang Diselesaikan
- ✅ Kamera QR butuh HTTPS (security browser)
- ✅ Backend Laravel hanya HTTP (port 8000)
- ✅ Mixed Content Error (HTTPS → HTTP)
- ✅ CORS Error

## Solusi: Vite Proxy

### Cara Kerja
1. **Frontend**: HTTPS via Vite + mkcert (self-signed SSL)
2. **Vite Proxy**: Forward request `/api` ke backend HTTP
3. **Backend**: Laravel HTTP (localhost:8000)

```
HP/Browser (HTTPS)
    ↓
Vite HTTPS Server (192.168.1.3:5173)
    ↓ Proxy
Laravel HTTP Server (127.0.0.1:8000)
```

### Konfigurasi

#### 1. vite.config.js
```javascript
server: {
  https: true,
  host: '0.0.0.0',
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      secure: false,
    },
    '/storage': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

#### 2. src/api.js
```javascript
// Jika HTTPS, pakai relative URL (akan di-proxy Vite)
if (protocol === 'https:') {
  return '/api';  // → proxied to http://127.0.0.1:8000/api
}
```

#### 3. ProfileController.php
```php
// Return relative URL (bukan absolute)
$photoUrl = '/storage/' . $user->profile_photo;
// Akan di-proxy: /storage/... → http://127.0.0.1:8000/storage/...
```

## Cara Menggunakan

### Development (di PC)
```bash
# Terminal 1: Laravel backend
cd d:\qrrr\qrbe
php artisan serve

# Terminal 2: Vite frontend
cd d:\qrrr\qrfe
npm run dev
```

**Akses:**
- PC: `http://localhost:5173` atau `https://192.168.1.3:5173`
- HP (WiFi sama): `https://192.168.1.3:5173`

### Fitur yang Jalan
- ✅ Login/Register
- ✅ Forgot Password
- ✅ Scan QR Code (kamera HP)
- ✅ Upload foto profil
- ✅ Semua API requests

## Troubleshooting

### Error: Mixed Content
**Penyebab**: Frontend HTTPS tapi backend HTTP

**Solusi**: Restart Vite server (Ctrl+C → npm run dev)

### Error: CORS
**Penyebab**: Backend CORS config belum allow origin

**Solusi**: Update `qrbe/config/cors.php`:
```php
'allowed_origins' => ['*'], // Development only
```

### Error: NET::ERR_CERT_INVALID
**Penyebab**: Self-signed certificate tidak dipercaya browser

**Solusi**: 
- Chrome: Klik "Advanced" → "Proceed to site"
- Edge: Klik "Details" → "Go on to webpage"

### Kamera tidak jalan di HP
**Penyebab**: HP dan PC beda WiFi, atau pakai HTTP

**Solusi**:
1. Pastikan HP dan PC di WiFi yang sama
2. Akses via HTTPS: `https://192.168.1.3:5173`
3. Accept self-signed certificate

## Production Setup (Optional)

Jika deploy production, gunakan **ngrok** untuk backend:

```bash
# Terminal 3: Ngrok untuk backend
ngrok http 8000
```

Update `src/api.js`:
```javascript
const BACKEND_NGROK_URL = 'https://abc123.ngrok-free.app';
```

Atau deploy ke server dengan SSL certificate (Let's Encrypt).

## File yang Diubah
1. `qrfe/vite.config.js` - Tambah proxy config
2. `qrfe/src/api.js` - Auto-detect HTTPS dan pakai proxy
3. `qrbe/config/cors.php` - Allow all origins (development)

## Testing
1. Buka `https://192.168.1.3:5173/forgot-password`
2. Masukkan email: `faqih@test.com`
3. Klik "Selanjutnya"
4. Harus redirect ke halaman reset password (tidak error)

## Catatan Penting
- Self-signed certificate **hanya untuk development**
- Production harus pakai SSL certificate valid (Let's Encrypt)
- Proxy Vite hanya jalan di development mode
- Untuk production build, gunakan ngrok atau reverse proxy (Nginx)
