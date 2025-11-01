<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\AdminController;

// RUTE PUBLIK (Login)
Route::post('/login', [AuthController::class, 'login']);

// RUTE TERPROTEKSI (Auth: Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rute Praktikan: Absensi
    Route::post('/attendance/checkin-qr', [AttendanceController::class, 'checkin']);

    // ADMIN AREA: Menggunakan string 'admin' (tidak ada function/Closure)
    Route::prefix('admin')->middleware('admin')->group(function () { 
        Route::post('/attendance/qr/generate', [AdminController::class, 'generateQrToken']); 
        Route::get('/attendance/qr/active',    [AdminController::class, 'getActiveQrToken']);
    });
});