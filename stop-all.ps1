# ========================================
# QR Lab - Stop All Services
# ========================================

Write-Host "========================================" -ForegroundColor Red
Write-Host "  Stopping All Services" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Stop Laravel (PHP)
Write-Host "Stopping Laravel (php artisan serve)..." -ForegroundColor Yellow
Get-Process -Name php -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ PHP stopped" -ForegroundColor Green

# Stop Node (Vite)
Write-Host "Stopping Vite (npm run dev)..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Node stopped" -ForegroundColor Green

# Stop Ngrok
Write-Host "Stopping Ngrok tunnels..." -ForegroundColor Yellow
Get-Process -Name ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Ngrok stopped" -ForegroundColor Green

# Kill ports (jika masih terbuka)
Write-Host ""
Write-Host "Checking ports..." -ForegroundColor Yellow

# Check port 8000
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "Killing process on port 8000..." -ForegroundColor Yellow
    $port8000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
    Write-Host "✅ Port 8000 freed" -ForegroundColor Green
} else {
    Write-Host "✅ Port 8000 already free" -ForegroundColor Green
}

# Check port 5173
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "Killing process on port 5173..." -ForegroundColor Yellow
    $port5173 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
    Write-Host "✅ Port 5173 freed" -ForegroundColor Green
} else {
    Write-Host "✅ Port 5173 already free" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ All Services Stopped!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to close..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
