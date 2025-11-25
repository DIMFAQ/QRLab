# ========================================
# START LOKAL - AKSES DARI HP & PC
# ========================================
# Mode: WiFi lokal (GRATIS, tanpa ngrok)
# PC dan HP harus di WiFi yang sama
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QR Lab - Mode WiFi Lokal (GRATIS)" -ForegroundColor Cyan
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
$firewallRule = Get-NetFirewallRule -Name "Laravel*" -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    Write-Host "WARNING Firewall rule belum ada" -ForegroundColor Yellow
    Write-Host "Menambahkan firewall rules untuk port 8000 dan 5173..." -ForegroundColor Yellow
    
    try {
        netsh advfirewall firewall add rule name="Laravel 8000" dir=in action=allow protocol=TCP localport=8000 | Out-Null
        netsh advfirewall firewall add rule name="Vite 5173" dir=in action=allow protocol=TCP localport=5173 | Out-Null
        Write-Host "OK Firewall rules added" -ForegroundColor Green
    } catch {
        Write-Host "WARNING Gagal tambah firewall rules (butuh admin)" -ForegroundColor Yellow
        Write-Host "Jalankan PowerShell as Administrator jika HP tidak bisa akses" -ForegroundColor Yellow
    }
} else {
    Write-Host "OK Firewall rules exist" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host ""

# 1. Start Backend Laravel
Write-Host "1. Starting Backend Laravel..." -ForegroundColor Yellow
$backendCmd = "cd 'd:\qrrr\qrbe'; Write-Host '=== BACKEND LARAVEL ===' -ForegroundColor Green; Write-Host 'Local: http://localhost:8000' -ForegroundColor White; Write-Host 'WiFi : http://$wifiIP:8000' -ForegroundColor Cyan; Write-Host ''; php artisan serve --host=0.0.0.0 --port=8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 3

# 2. Start Frontend Vite
Write-Host "2. Starting Frontend Vite..." -ForegroundColor Yellow
$frontendCmd = "cd 'd:\qrrr\qrfe'; Write-Host '=== FRONTEND VITE ===' -ForegroundColor Blue; Write-Host 'Local: http://localhost:5173' -ForegroundColor White; Write-Host 'WiFi : http://$wifiIP:5173' -ForegroundColor Cyan; Write-Host ''; npm run dev -- --host 0.0.0.0"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "AKSES DARI PC:" -ForegroundColor Cyan
Write-Host "  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "AKSES DARI HP (WiFi sama):" -ForegroundColor Cyan
Write-Host "  http://$wifiIP:5173" -ForegroundColor White
Write-Host ""
Write-Host "LOGIN:" -ForegroundColor Cyan
Write-Host "  Admin     : admin@example.com / password" -ForegroundColor Gray
Write-Host "  Praktikan : mahasiswa1@example.com / password" -ForegroundColor Gray
Write-Host ""
Write-Host "PENTING - KAMERA DI HP:" -ForegroundColor Yellow
Write-Host "  Kamera butuh HTTPS, tapi ini HTTP." -ForegroundColor Gray
Write-Host "  Solusi:" -ForegroundColor Gray
Write-Host "  1. Buka Chrome di HP" -ForegroundColor White
Write-Host "  2. Ketik: chrome://flags" -ForegroundColor White
Write-Host "  3. Search: Insecure origins treated as secure" -ForegroundColor White
Write-Host "  4. Enable dan add: http://$wifiIP`:5173" -ForegroundColor White
Write-Host "  5. Relaunch Chrome" -ForegroundColor White
Write-Host "  6. Buka: http://$wifiIP`:5173" -ForegroundColor White
Write-Host ""
Write-Host "TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host "  HP tidak bisa akses? Jalankan PowerShell as Admin, lalu:" -ForegroundColor Gray
Write-Host "  netsh advfirewall firewall add rule name=`"Laravel 8000`" dir=in action=allow protocol=TCP localport=8000" -ForegroundColor White
Write-Host "  netsh advfirewall firewall add rule name=`"Vite 5173`" dir=in action=allow protocol=TCP localport=5173" -ForegroundColor White
Write-Host ""
Write-Host "Stop semua: Get-Process -Name php,node | Stop-Process -Force" -ForegroundColor Yellow
Write-Host ""
