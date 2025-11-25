# ===================================================
# FIX: HP TIDAK BISA AKSES - UBAH NETWORK KE PRIVATE
# ===================================================
# Script ini harus dijalankan sebagai ADMINISTRATOR
# Klik kanan PowerShell -> Run as Administrator
# ===================================================

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "ERROR: Script ini harus dijalankan sebagai Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cara menjalankan:" -ForegroundColor Yellow
    Write-Host "1. Tutup PowerShell ini" -ForegroundColor White
    Write-Host "2. Klik kanan icon PowerShell" -ForegroundColor White
    Write-Host "3. Pilih 'Run as Administrator'" -ForegroundColor White
    Write-Host "4. Jalankan lagi: cd d:\qrrr ; .\fix-network-public.ps1" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX: Network Public -> Private" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current network profile
$profile = Get-NetConnectionProfile
Write-Host "Network saat ini:" -ForegroundColor Yellow
Write-Host "  Name: $($profile.Name)" -ForegroundColor White
Write-Host "  Category: $($profile.NetworkCategory)" -ForegroundColor $(if ($profile.NetworkCategory -eq 'Public') { 'Red' } else { 'Green' })
Write-Host ""

if ($profile.NetworkCategory -eq 'Public') {
    Write-Host "MASALAH DITEMUKAN!" -ForegroundColor Red
    Write-Host "  Network category = Public" -ForegroundColor Red
    Write-Host "  Windows AUTO-BLOCK semua incoming connections di Public network!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Mengubah ke Private..." -ForegroundColor Yellow
    
    try {
        Set-NetConnectionProfile -Name $profile.Name -NetworkCategory Private
        Write-Host "SUCCESS Network diubah ke Private!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Cek ulang:" -ForegroundColor Yellow
        $newProfile = Get-NetConnectionProfile
        Write-Host "  Category: $($newProfile.NetworkCategory)" -ForegroundColor Green
        Write-Host ""
        Write-Host "SEKARANG HP BISA AKSES!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "ERROR Gagal ubah network category!" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Host "Solusi alternatif:" -ForegroundColor Yellow
        Write-Host "1. Buka Settings -> Network & Internet -> WiFi" -ForegroundColor White
        Write-Host "2. Klik WiFi yang aktif ($($profile.Name))" -ForegroundColor White
        Write-Host "3. Scroll ke bawah -> Network profile" -ForegroundColor White
        Write-Host "4. Pilih 'Private'" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "OK Network sudah Private!" -ForegroundColor Green
    Write-Host ""
}

# Double-check firewall rules
Write-Host "Checking firewall rules..." -ForegroundColor Yellow
$rules = netsh advfirewall firewall show rule name=all | Select-String -Pattern "Laravel 8000|Vite 5173"
if ($rules) {
    Write-Host "OK Firewall rules exist" -ForegroundColor Green
} else {
    Write-Host "WARNING Firewall rules tidak ditemukan, menambahkan..." -ForegroundColor Yellow
    netsh advfirewall firewall add rule name="Laravel 8000" dir=in action=allow protocol=TCP localport=8000 profile=any
    netsh advfirewall firewall add rule name="Vite 5173" dir=in action=allow protocol=TCP localport=5173 profile=any
    Write-Host "OK Firewall rules added" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SELESAI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Sekarang test dari HP:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Pastikan backend & frontend sudah jalan:" -ForegroundColor Yellow
Write-Host "     cd d:\qrrr" -ForegroundColor White
Write-Host "     .\start-https.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  2. Cek IP PC:" -ForegroundColor Yellow
Write-Host "     ipconfig | Select-String '192.168'" -ForegroundColor White
Write-Host ""
Write-Host "  3. Buka di HP:" -ForegroundColor Yellow
Write-Host "     https://192.168.1.3:5173" -ForegroundColor White
Write-Host ""
Write-Host "  4. Bypass warning 'Not Secure':" -ForegroundColor Yellow
Write-Host "     Chrome: Ketik 'thisisunsafe'" -ForegroundColor White
Write-Host "     Safari: Tap 'Show Details' -> 'Visit Website'" -ForegroundColor White
Write-Host ""
Write-Host "  5. Login dan test kamera!" -ForegroundColor Yellow
Write-Host ""
