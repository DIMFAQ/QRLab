# ========================================
# UPDATE BACKEND NGROK URL
# ========================================
# Script ini untuk update URL ngrok backend
# di file api.js tanpa perlu edit manual
# ========================================

param(
    [Parameter(Mandatory=$true)]
    [string]$NgrokUrl
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Update Backend Ngrok URL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Validasi URL
if ($NgrokUrl -notmatch "^https://.*\.ngrok.*\.app$") {
    Write-Host "ERROR URL tidak valid!" -ForegroundColor Red
    Write-Host "Format yang benar: https://abc123.ngrok-free.app" -ForegroundColor Yellow
    exit 1
}

# Path file api.js
$apiJsPath = "d:\qrrr\qrfe\src\api.js"

if (-not (Test-Path $apiJsPath)) {
    Write-Host "ERROR File api.js tidak ditemukan di: $apiJsPath" -ForegroundColor Red
    exit 1
}

# Baca file
$content = Get-Content $apiJsPath -Raw

# Replace URL
$pattern = "const BACKEND_NGROK_URL = '.*';"
$replacement = "const BACKEND_NGROK_URL = '$NgrokUrl';"

if ($content -match $pattern) {
    $newContent = $content -replace $pattern, $replacement
    Set-Content -Path $apiJsPath -Value $newContent -NoNewline
    
    Write-Host "SUCCESS Backend URL berhasil diupdate!" -ForegroundColor Green
    Write-Host "File: $apiJsPath" -ForegroundColor Gray
    Write-Host "URL: $NgrokUrl" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Refresh browser untuk apply perubahan (F5)" -ForegroundColor Yellow
} else {
    Write-Host "ERROR Pattern tidak ditemukan di file!" -ForegroundColor Red
    Write-Host "Pastikan file api.js ada baris: const BACKEND_NGROK_URL = '...';" -ForegroundColor Yellow
}
