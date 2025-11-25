# 🎓 QR Lab - Sistem Presensi QR Code untuk Praktikum

## 📋 Deskripsi Proyek

Sistem presensi berbasis QR Code untuk praktikum/laboratorium dengan fitur:
- ✅ QR Scanner real-time dari HP (kamera belakang)
- ✅ Dashboard admin & mahasiswa
- ✅ Master data (Course & Class management)
- ✅ Auto-generate QR Code dengan expiry
- ✅ Rekap absensi dengan export CSV
- ✅ Statistics & analytics
- ✅ Responsive design (desktop & mobile)

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Laravel 11.x
- **Database:** SQLite
- **Auth:** Laravel Sanctum (Bearer Token)
- **Timezone:** GMT+7 (Asia/Jakarta)

### Frontend
- **Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.14
- **Styling:** Tailwind CSS 4.1.16
- **QR Scanner:** @yudiel/react-qr-scanner
- **QR Generate:** qrcode.react
- **Charts:** Chart.js + react-chartjs-2

---

## 📁 Struktur Proyek

```
d:\qrrr\
├── qrbe\                 # Backend Laravel
│   ├── app\
│   │   ├── Http\
│   │   │   └── Controllers\
│   │   │       └── API\
│   │   │           ├── AdminController.php       # Stats, CRUD mahasiswa
│   │   │           ├── AuthController.php        # Login, Register, Verify
│   │   │           ├── MasterDataController.php  # Courses, Classes CRUD
│   │   │           └── MeetingController.php     # Meeting/Sesi management
│   │   └── Models\
│   │       ├── Attendance.php
│   │       ├── ClassModel.php
│   │       ├── Course.php
│   │       ├── Meeting.php
│   │       ├── MeetingToken.php
│   │       └── Member.php
│   ├── database\
│   │   ├── migrations\
│   │   └── seeders\
│   └── routes\
│       └── api.php
│
├── qrfe\                 # Frontend React
│   ├── src\
│   │   ├── api.js                    # Axios config (auto-detect ngrok/local)
│   │   ├── components\
│   │   │   ├── MeetingForm.jsx
│   │   │   └── QrScanner.jsx         # QR Scanner component
│   │   ├── layouts\
│   │   │   ├── AdminLayout.jsx
│   │   │   └── PraktikanLayout.jsx
│   │   └── pages\
│   │       ├── AdminDashboard.jsx    # Stats, charts
│   │       ├── AdminKelolaSesi.jsx   # Manage sessions
│   │       ├── AdminRekapAbsensi.jsx # Attendance report
│   │       └── PraktikanDashboard.jsx # QR Scanner page
│   └── vite.config.js
│
├── start-ngrok.ps1       # Auto-start all services
├── stop-all.ps1          # Stop all services
├── NGROK_SETUP_LENGKAP.md
└── QUICK_START_NGROK.md
```

---

## 🚀 Quick Start

### Persiapan (Sekali Saja)

#### 1. Install Dependencies

**Backend:**
```powershell
cd d:\qrrr\qrbe
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=MasterDataSeeder
```

**Frontend:**
```powershell
cd d:\qrrr\qrfe
npm install
```

#### 2. Setup Ngrok (Untuk Akses dari HP)
```powershell
# Install ngrok
choco install ngrok

# Get authtoken dari: https://dashboard.ngrok.com
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### Jalankan Aplikasi

#### Opsi A: Dengan Ngrok (Untuk HP) - RECOMMENDED
```powershell
cd d:\qrrr
.\start-ngrok.ps1
```

**Setelah script jalan:**
1. Copy URL dari Terminal 3 (Backend Ngrok): `https://abc123.ngrok-free.app`
2. Copy URL dari Terminal 4 (Frontend Ngrok): `https://xyz789.ngrok-free.app`
3. Update `qrfe\src\api.js` line 8: `BACKEND_NGROK_URL = 'https://abc123...'`
4. Update `qrbe\.env`:
   ```env
   APP_URL=https://abc123.ngrok-free.app
   FRONTEND_URL=https://xyz789.ngrok-free.app
   ```
5. Restart backend (Ctrl+C di Terminal 1, lalu Enter)
6. Akses dari HP: `https://xyz789.ngrok-free.app`

**Baca panduan detail:** `NGROK_SETUP_LENGKAP.md`

#### Opsi B: Lokal (Tanpa HP)
```powershell
# Terminal 1: Backend
cd d:\qrrr\qrbe
php artisan serve

# Terminal 2: Frontend
cd d:\qrrr\qrfe
npm run dev

# Akses: http://localhost:5173
```

---

## 👥 Default Users

### Admin
- **Email:** admin@example.com
- **Password:** password

### Mahasiswa (Sample)
- **Email:** mahasiswa1@example.com
- **Password:** password
- **NPM:** 2021001

---

## 🎯 Fitur Lengkap

### 🔐 Authentication
- [x] Register mahasiswa
- [x] Email verification
- [x] Login (admin & mahasiswa)
- [x] Logout
- [x] Bearer token authentication
- [x] Role-based access control

### 👨‍💼 Admin Features

#### Dashboard
- [x] Stats cards (Total mahasiswa, Hadir hari ini, Sesi aktif, Total pertemuan)
- [x] 7-day attendance chart
- [x] Quick menu (Kelola Sesi, Kelola Mahasiswa, Rekap Absensi)

#### Kelola Sesi
- [x] List semua meeting/sesi
- [x] Create meeting dengan auto-generate QR
- [x] QR Code display dengan expiry timer
- [x] Start/Stop session
- [x] **Reopen session** untuk mahasiswa terlambat
- [x] View attendance per session
- [x] Session auto-close saat token expired

#### Master Data
- [x] **Course Management** (CRUD praktikum)
  - Algoritma & Struktur Data
  - Jaringan Komputer
  - Basis Data
  - Pemrograman Web
  - Sistem Operasi
- [x] **Class Management** (CRUD kelas)
  - Kelas A, B, C, D
  - Capacity setting
- [x] Dropdown selection (no manual typing)
- [x] **Unique constraint:** 1 pertemuan = 1 kombinasi (course + class + meeting_number)

#### Rekap Absensi
- [x] Filter by Course, Class, Meeting
- [x] Table view dengan:
  - NPM
  - Nama
  - Waktu Scan (GMT+7)
  - Status (Hadir/Terlambat/Alpa)
- [x] Export to CSV
- [x] Auto-detect late (>15 min dari start_time)
- [x] Info message jika belum ada pertemuan

#### Kelola Mahasiswa
- [x] List semua mahasiswa
- [x] Search by NPM/Nama
- [x] Filter by status (Active/Pending)
- [x] CRUD mahasiswa
- [x] Approve/Reject pendaftaran

### 👨‍🎓 Mahasiswa Features

#### Dashboard
- [x] **QR Scanner** dengan kamera HP
  - Auto-detect kamera belakang
  - Real-time scanning
  - Debounce (2 detik anti-spam)
  - Success/Error feedback
- [x] Attendance history
- [x] Profile view

---

## 📊 Database Schema

### Tables
1. **users** - Authentication
2. **members** - Mahasiswa data (NPM, nama)
3. **courses** - Master praktikum
4. **classes** - Master kelas
5. **meetings** - Sesi praktikum
   - **Unique:** (course_id, class_id, meeting_number)
6. **meeting_tokens** - QR tokens dengan expiry
7. **attendances** - Record kehadiran
8. **personal_access_tokens** - Sanctum tokens

### Key Relations
- `Meeting` belongsTo `Course`, `ClassModel`, `User` (admin)
- `Meeting` hasMany `Attendance`, `MeetingToken`
- `Attendance` belongsTo `Member`, `Meeting`
- `Member` hasOne `User`

---

## 🔧 Konfigurasi Penting

### Backend (.env)
```env
APP_URL=http://127.0.0.1:8000        # Atau ngrok URL
FRONTEND_URL=http://localhost:5173    # Atau ngrok URL

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

SESSION_DRIVER=database
CACHE_DRIVER=file

# Untuk ngrok
SANCTUM_STATEFUL_DOMAINS=xyz789.ngrok-free.app
SESSION_DOMAIN=.ngrok-free.app
```

### Frontend (api.js)
```javascript
// Auto-detect environment
const BACKEND_NGROK_URL = 'https://abc123.ngrok-free.app'; // Update saat ngrok restart

const getBaseURL = () => {
    if (hostname.includes('ngrok')) return `${BACKEND_NGROK_URL}/api`;
    if (hostname === 'localhost') return 'http://127.0.0.1:8000/api';
    return `http://${hostname}:8000/api`;
};
```

### CORS (cors.php)
```php
'allowed_origins' => [
    'http://localhost:5173',
    env('FRONTEND_URL', '*'),
],
'allowed_origins_patterns' => [
    '/^https:\/\/.*\.ngrok-free\.app$/',
],
'supports_credentials' => true,
```

---

## 🧪 Testing

### Manual Testing Checklist

#### ✅ Backend API
```powershell
# Health check
curl http://127.0.0.1:8000/api/health

# Stats
curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:8000/api/admin/stats
```

#### ✅ Frontend
1. Login admin → Dashboard stats muncul
2. Buat sesi baru → QR code muncul
3. Login mahasiswa → Scanner aktif
4. Scan QR → Absensi tersimpan
5. Check rekap → Data muncul
6. Export CSV → File terdownload

#### ✅ Validations
1. Duplikasi pertemuan → Error message
2. Filter rekap tanpa data → Info message
3. QR expired → Error "Token expired"
4. Scan ulang → Error "Sudah absen"

---

## 📱 Mobile Testing (Ngrok)

### Prerequisites
- ✅ Ngrok installed & authtoken configured
- ✅ HP terhubung internet (WiFi/4G, tidak harus WiFi sama)
- ✅ Browser: Chrome (Android) atau Safari (iOS)

### Steps
1. Jalankan `start-ngrok.ps1`
2. Update config (api.js, .env)
3. Restart backend
4. Buka ngrok frontend URL di HP: `https://xyz789.ngrok-free.app`
5. Klik "Visit Site" (bypass warning)
6. Test QR Scanner → Allow camera permission

### Expected Results
- ✅ Login berhasil
- ✅ Dashboard loading dengan data
- ✅ QR Scanner aktif (kamera belakang)
- ✅ Scan QR berhasil → Success message
- ✅ Data absensi tersimpan

---

## 🐛 Troubleshooting

### Camera Tidak Aktif di HP
**Penyebab:** HTTP tidak support `getUserMedia()`  
**Solusi:** Gunakan **HTTPS** (ngrok)

### CORS Error
**Solusi:**
1. Update `cors.php` dengan frontend URL
2. Restart backend: `php artisan config:clear`
3. Clear browser cache di HP

### Ngrok Tunnel Expired
**Penyebab:** Free plan = 2 jam limit  
**Solusi:**
1. Restart ngrok (dapat URL baru)
2. Update `api.js` + `.env`
3. Restart backend

### Port Already in Use
**Solusi:**
```powershell
.\stop-all.ps1
```

### QR Scan Tidak Detect
**Solusi:**
1. Pastikan QR code cukup besar di layar
2. Cahaya cukup terang
3. Kamera fokus stabil
4. Check console log untuk error

---

## 📚 Dokumentasi Lengkap

- **Setup Ngrok:** `NGROK_SETUP_LENGKAP.md`
- **Quick Start:** `QUICK_START_NGROK.md`
- **Server Instructions:** `INSTRUKSI_MENJALANKAN_SERVER.md`
- **Master Data:** `MASTER_DATA_IMPLEMENTATION.md`
- **Dashboard Stats:** `DASHBOARD_STATS_DOCUMENTATION.md`

---

## 🔄 Development Workflow

### Daily Development
```powershell
# Start
.\start-ngrok.ps1

# Code changes...

# Stop
.\stop-all.ps1
```

### Deploy ke Production
1. Build frontend: `npm run build`
2. Copy `dist/` ke Laravel `public/`
3. Configure web server (nginx/apache)
4. Setup SSL certificate
5. Update `.env` untuk production

---

## 🤝 Contributing

### Code Structure
- **Controllers:** RESTful API endpoints
- **Models:** Eloquent ORM
- **Migrations:** Database schema
- **Seeders:** Sample data
- **Components:** Reusable React components
- **Pages:** Full page views

### Best Practices
- ✅ Use meaningful variable names
- ✅ Add comments for complex logic
- ✅ Follow Laravel & React conventions
- ✅ Test before commit
- ✅ Update documentation

---

## 📄 License

MIT License - Feel free to use for educational purposes

---

## 🆘 Support

### Issues?
1. Check `NGROK_SETUP_LENGKAP.md`
2. Check Ngrok Inspector: `http://127.0.0.1:4040`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Check browser console (F12)

### Contact
- **Repository:** https://github.com/Vian-98/Presensi_QR
- **Email:** [Your email]

---

**🎉 Semua fitur sudah siap digunakan dari HP dengan ngrok! Happy coding!**
