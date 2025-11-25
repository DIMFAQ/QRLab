# ========================================
# START HTTPS GRATIS - SELF-SIGNED SSL
# ========================================
# Mode: HTTPS dengan self-signed certificate
# Kamera bisa jalan di HP (walaupun cert "not trusted")
# GRATIS 100%
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QR Lab - HTTPS Mode (Self-Signed)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop semua process dulu
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name php,node,ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "OK Processes stopped" -ForegroundColor Green
Write-Host ""

# Detect IP WiFi
Write-Host "Detecting WiFi IP..." -ForegroundColor Yellow
$wifiIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -match "^192\.168\." -and $_.PrefixOrigin -eq "Dhcp"} | Select-Object -First 1).IPAddress

if (-not $wifiIP) {
    Write-Host "ERROR Tidak bisa deteksi IP WiFi!" -ForegroundColor Red
    Write-Host "Pastikan PC terhubung ke WiFi" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK WiFi IP detected: $wifiIP" -ForegroundColor Green
Write-Host ""

# Check Firewall
Write-Host "Checking Windows Firewall..." -ForegroundColor Yellow
try {
    $existingRules = netsh advfirewall firewall show rule name=all | Select-String -Pattern "Laravel|Vite"
    if (-not $existingRules) {
        Write-Host "Adding firewall rules..." -ForegroundColor Yellow
        netsh advfirewall firewall add rule name="Laravel 8000" dir=in action=allow protocol=TCP localport=8000 | Out-Null
        netsh advfirewall firewall add rule name="Vite 5173" dir=in action=allow protocol=TCP localport=5173 | Out-Null
        Write-Host "OK Firewall rules added" -ForegroundColor Green
    } else {
        Write-Host "OK Firewall rules exist" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING Firewall check failed (run as Admin if HP can't access)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting services with HTTPS..." -ForegroundColor Cyan
Write-Host ""

# 1. Start Backend Laravel
Write-Host "1. Starting Backend Laravel (HTTP:8000)..." -ForegroundColor Yellow
$backendCmd = "cd 'd:\qrrr\qrbe'; `$host.UI.RawUI.WindowTitle = 'Backend Laravel'; Write-Host '=== BACKEND LARAVEL ===' -ForegroundColor Green; Write-Host 'HTTP: http://localhost:8000' -ForegroundColor White; Write-Host 'HTTP: http://$wifiIP:8000' -ForegroundColor Cyan; Write-Host ''; php artisan serve --host=0.0.0.0 --port=8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 3

# 2. Start Frontend Vite (HTTPS)
Write-Host "2. Starting Frontend Vite (HTTPS:5173)..." -ForegroundColor Yellow
$frontendCmd = "cd 'd:\qrrr\qrfe'; `$host.UI.RawUI.WindowTitle = 'Frontend Vite HTTPS'; Write-Host '=== FRONTEND VITE (HTTPS) ===' -ForegroundColor Blue; Write-Host 'HTTPS: https://localhost:5173' -ForegroundColor White; Write-Host 'HTTPS: https://$wifiIP:5173' -ForegroundColor Cyan; Write-Host ''; Write-Host 'PENTING: Pertama kali akan generate SSL certificate...' -ForegroundColor Yellow; Write-Host ''; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "AKSES DARI PC:" -ForegroundColor Cyan
Write-Host "  https://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "AKSES DARI HP (WiFi sama):" -ForegroundColor Cyan
Write-Host "  https://$wifiIP:5173" -ForegroundColor White
Write-Host ""
Write-Host "LOGIN:" -ForegroundColor Cyan
Write-Host "  Admin     : admin@example.com / password" -ForegroundColor Gray
Write-Host "  Praktikan : mahasiswa1@example.com / password" -ForegroundColor Gray
Write-Host ""
Write-Host "PENTING - CERTIFICATE WARNING:" -ForegroundColor Yellow
Write-Host "  Browser akan warning 'Not Secure' karena self-signed cert." -ForegroundColor Gray
Write-Host "  Ini NORMAL dan AMAN untuk development." -ForegroundColor Gray
Write-Host ""
Write-Host "  DI PC:" -ForegroundColor White
Write-Host "    - Chrome: Klik 'Advanced' -> 'Proceed to localhost (unsafe)'" -ForegroundColor Gray
Write-Host "    - Edge: Klik 'Advanced' -> 'Continue to localhost'" -ForegroundColor Gray
Write-Host ""
Write-Host "  DI HP:" -ForegroundColor White
Write-Host "    - Buka: https://$wifiIP:5173" -ForegroundColor Gray
Write-Host "    - Chrome: Ketik 'thisisunsafe' (langsung ketik, gak ada input)" -ForegroundColor Gray
Write-Host "    - Safari: Tap 'Show Details' -> 'Visit Website'" -ForegroundColor Gray
Write-Host ""
Write-Host "KAMERA:" -ForegroundColor Yellow
Write-Host "  Setelah bypass warning di atas, kamera LANGSUNG JALAN!" -ForegroundColor Green
Write-Host "  Tidak perlu Chrome Flags lagi karena sudah HTTPS." -ForegroundColor Gray
Write-Host ""
Write-Host "Stop semua: Get-Process -Name php,node | Stop-Process -Force" -ForegroundColor Yellow
Write-Host ""
