# ========================================
# QR Lab - Ngrok Startup Script
# ========================================
# Script ini akan membuka 4 terminal PowerShell:
# 1. Backend Laravel (port 8000)
# 2. Frontend Vite (port 5173)
# 3. Ngrok untuk Backend
# 4. Ngrok untuk Frontend
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QR Lab - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check jika ngrok sudah terinstall
Write-Host "Checking ngrok installation..." -ForegroundColor Yellow

# Cek di beberapa lokasi umum
$ngrokPaths = @(
    "ngrok",  # Di PATH
    "C:\Users\Pongo\ngrok\ngrok.exe",  # Custom location
    "$env:LOCALAPPDATA\ngrok\ngrok.exe",
    "$env:ProgramFiles\ngrok\ngrok.exe"
)

$ngrokExe = $null
foreach ($path in $ngrokPaths) {
    try {
        $testCmd = if ($path -eq "ngrok") { "ngrok" } else { $path }
        $null = & $testCmd version 2>&1
        $ngrokExe = $path
        break
    } catch {
        continue
    }
}

if (-not $ngrokExe) {
    Write-Host "ERROR Ngrok not found!" -ForegroundColor Red
    Write-Host "Install ngrok dulu: choco install ngrok" -ForegroundColor Yellow
    Write-Host "Atau download: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

try {
    $ngrokVersion = & $ngrokExe version 2>&1
    Write-Host "OK Ngrok found: $ngrokVersion" -ForegroundColor Green
    Write-Host "   Path: $ngrokExe" -ForegroundColor Gray
} catch {
    Write-Host "ERROR Cannot execute ngrok!" -ForegroundColor Red
    exit 1
}

# Check jika ngrok authtoken sudah dikonfigurasi
Write-Host "Checking ngrok authtoken..." -ForegroundColor Yellow
$ngrokConfigPath1 = "$env:USERPROFILE\.ngrok2\ngrok.yml"
$ngrokConfigPath2 = "$env:LOCALAPPDATA\ngrok\ngrok.yml"
$ngrokConfig = $null
if (Test-Path $ngrokConfigPath1) {
    $ngrokConfig = Get-Content $ngrokConfigPath1 -ErrorAction SilentlyContinue
} elseif (Test-Path $ngrokConfigPath2) {
    $ngrokConfig = Get-Content $ngrokConfigPath2 -ErrorAction SilentlyContinue
}
if ($ngrokConfig -and ($ngrokConfig -match "authtoken:")) {
    Write-Host "OK Ngrok authtoken configured" -ForegroundColor Green
} else {
    Write-Host "WARNING Ngrok authtoken belum dikonfigurasi" -ForegroundColor Yellow
    Write-Host "Jalankan: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Yellow
    $continue = Read-Host "Lanjutkan tanpa authtoken? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host ""

# 1. Start Backend Laravel
Write-Host "1. Starting Backend Laravel (port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'd:\qrrr\qrbe'; Write-Host 'Backend Laravel Server' -ForegroundColor Green; php artisan serve --host=127.0.0.1 --port=8000"
)
Start-Sleep -Seconds 2

# 2. Start Frontend Vite
Write-Host "2. Starting Frontend Vite (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'd:\qrrr\qrfe'; Write-Host 'Frontend React + Vite' -ForegroundColor Blue; npm run dev"
)
Start-Sleep -Seconds 3

# 3. Start Ngrok Backend
Write-Host "3. Starting Ngrok for Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'Ngrok Backend Tunnel' -ForegroundColor Magenta; Write-Host 'COPY URL HTTPS dari output ini!' -ForegroundColor Yellow; & '$ngrokExe' http 8000"
)
Start-Sleep -Seconds 2

# 4. Start Ngrok Frontend
Write-Host "4. Starting Ngrok for Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'Ngrok Frontend Tunnel' -ForegroundColor Magenta; Write-Host 'COPY URL HTTPS dari output ini!' -ForegroundColor Yellow; & '$ngrokExe' http 5173"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "LANGKAH SELANJUTNYA:" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1] Tunggu 10 detik sampai semua service running..." -ForegroundColor Yellow
Write-Host ""
Write-Host "[2] Lihat TERMINAL 3 (Ngrok Backend):" -ForegroundColor Yellow
Write-Host "    - Cari baris: 'Forwarding https://...ngrok-free.app -> http://localhost:8000'" -ForegroundColor Gray
Write-Host "    - COPY URL HTTPS-nya (contoh: https://abc123.ngrok-free.app)" -ForegroundColor Gray
Write-Host ""
Write-Host "[3] Update Backend URL di Frontend:" -ForegroundColor Yellow
Write-Host "    Jalankan command ini (ganti URL dengan URL dari step 2):" -ForegroundColor Gray
Write-Host "    .\update-ngrok-url.ps1 -NgrokUrl 'https://abc123.ngrok-free.app'" -ForegroundColor White
Write-Host ""
Write-Host "[4] Lihat TERMINAL 4 (Ngrok Frontend):" -ForegroundColor Yellow
Write-Host "    - Cari baris: 'Forwarding https://...ngrok-free.app -> http://localhost:5173'" -ForegroundColor Gray
Write-Host "    - COPY URL HTTPS-nya" -ForegroundColor Gray
Write-Host ""
Write-Host "[5] Buka di HP atau PC:" -ForegroundColor Yellow
Write-Host "    - Buka browser (Chrome/Safari)" -ForegroundColor Gray
Write-Host "    - Ketik URL dari step 4" -ForegroundColor Gray
Write-Host "    - Klik 'Visit Site' (kalau ada warning ngrok)" -ForegroundColor Gray
Write-Host "    - Login: mahasiswa1@example.com / password" -ForegroundColor Gray
Write-Host ""
Write-Host "Ngrok Inspector (lihat traffic):" -ForegroundColor Cyan
Write-Host "    http://127.0.0.1:4040" -ForegroundColor White
Write-Host ""
Write-Host "Panduan lengkap: PANDUAN_NGROK_LENGKAP.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "PENTING:" -ForegroundColor Red
Write-Host "    - Ngrok FREE hanya support 1 tunnel" -ForegroundColor Yellow
Write-Host "    - Kalau Terminal 3 atau 4 error 'ERR_NGROK_6022'," -ForegroundColor Yellow
Write-Host "      berarti sudah ada tunnel lain yang jalan" -ForegroundColor Yellow
Write-Host "    - Stop semua ngrok: Get-Process ngrok | Stop-Process -Force" -ForegroundColor Yellow
Write-Host ""

# Buka ngrok inspector di browser (optional)
# Start-Sleep -Seconds 5
# Start-Process "http://127.0.0.1:4040"

Write-Host ""
Write-Host "4 terminals opened. Check each terminal for status." -ForegroundColor Green
Write-Host ""
