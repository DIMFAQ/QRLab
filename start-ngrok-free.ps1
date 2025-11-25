# ========================================
# START - NGROK FREE (1 Tunnel Only)
# ========================================
# Karena ngrok free hanya support 1 tunnel,
# kita pakai tunnel untuk FRONTEND aja.
# Backend tetap localhost.
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QR Lab - Ngrok Free Mode (1 Tunnel)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop semua process dulu
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name php,node,ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Check ngrok
$ngrokExe = "C:\Users\Pongo\ngrok\ngrok.exe"
if (-not (Test-Path $ngrokExe)) {
    Write-Host "ERROR Ngrok not found at: $ngrokExe" -ForegroundColor Red
    exit 1
}

Write-Host "OK Ngrok found" -ForegroundColor Green
Write-Host ""
Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host ""

# 1. Start Backend Laravel (0.0.0.0 agar bisa diakses dari mana aja)
Write-Host "1. Starting Backend Laravel (0.0.0.0:8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'd:\qrrr\qrbe'; Write-Host '=== Backend Laravel Server ===' -ForegroundColor Green; Write-Host 'Accessible from: http://localhost:8000' -ForegroundColor Gray; Write-Host 'Accessible from: http://192.168.x.x:8000' -ForegroundColor Gray; php artisan serve --host=0.0.0.0 --port=8000"
)
Start-Sleep -Seconds 3

# 2. Start Frontend Vite
Write-Host "2. Starting Frontend Vite (localhost:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'd:\qrrr\qrfe'; Write-Host '=== Frontend React + Vite ===' -ForegroundColor Blue; npm run dev"
)
Start-Sleep -Seconds 5

# 3. Start Ngrok FRONTEND ONLY
Write-Host "3. Starting Ngrok for Frontend (HTTPS)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '=== Ngrok Frontend Tunnel ===' -ForegroundColor Magenta; Write-Host '' -ForegroundColor Yellow; Write-Host 'COPY URL HTTPS di bawah ini:' -ForegroundColor Yellow; Write-Host '' -ForegroundColor Yellow; & '$ngrokExe' http 5173"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "LANGKAH SELANJUTNYA:" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1] Tunggu 10 detik..." -ForegroundColor Yellow
Write-Host ""
Write-Host "[2] Lihat TERMINAL 3 (Ngrok Frontend):" -ForegroundColor Yellow
Write-Host "    Cari baris: 'Forwarding https://...ngrok-free.dev -> http://localhost:5173'" -ForegroundColor Gray
Write-Host "    COPY URL HTTPS-nya (contoh: https://xyz789.ngrok-free.dev)" -ForegroundColor Gray
Write-Host ""
Write-Host "[3] PENTING - Kosongkan backend URL:" -ForegroundColor Yellow
Write-Host "    Jalankan:" -ForegroundColor Gray
Write-Host "    .\update-ngrok-url.ps1 -NgrokUrl ''" -ForegroundColor White
Write-Host "    (String kosong agar frontend pakai localhost:8000)" -ForegroundColor Gray
Write-Host ""
Write-Host "[4] Buka di Browser:" -ForegroundColor Yellow
Write-Host "    - PC: http://localhost:5173" -ForegroundColor Gray
Write-Host "    - HP: https://xyz789.ngrok-free.dev (dari step 2)" -ForegroundColor Gray
Write-Host ""
Write-Host "[5] Login:" -ForegroundColor Yellow
Write-Host "    Email: mahasiswa1@example.com" -ForegroundColor Gray
Write-Host "    Password: password" -ForegroundColor Gray
Write-Host ""
Write-Host "CATATAN:" -ForegroundColor Cyan
Write-Host "  - Backend tetap localhost (tidak pakai ngrok)" -ForegroundColor Gray
Write-Host "  - Kamera HANYA jalan di HP (via ngrok HTTPS)" -ForegroundColor Gray
Write-Host "  - Di PC, kamera perlu Chrome Flags (lihat CARA_PAKAI_KAMERA.md)" -ForegroundColor Gray
Write-Host ""
Write-Host "Stop semua: Get-Process -Name php,node,ngrok | Stop-Process -Force" -ForegroundColor Yellow
Write-Host ""
