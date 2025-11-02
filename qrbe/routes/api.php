<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\MeetingController;
use App\Http\Controllers\API\PraktikanController;

// RUTE PUBLIK (Login)
Route::post('/login', [AuthController::class, 'login']);

// RUTE TERPROTEKSI (Auth: Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/praktikan/me', [PraktikanController::class, 'me']);
    Route::put('/praktikan/me', [PraktikanController::class, 'update']);
    Route::get('/praktikan/riwayat', [PraktikanController::class, 'riwayat']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rute Praktikan: Absensi
    Route::post('/attendance/checkin-qr', [AttendanceController::class, 'checkin']);
    Route::get('/my/attendance/history', [AttendanceController::class, 'history']);

    // ADMIN AREA: Menggunakan string 'admin' (tidak ada function/Closure)
    Route::prefix('admin')->middleware('admin')->group(function () { 
        // Route::post('/attendance/qr/generate', [AdminController::class, 'generateQrToken']); 
        // Route::get('/attendance/qr/active',    [AdminController::class, 'getActiveQrToken']);
        Route::apiResource('/meetings', MeetingController::class)->only(['store', 'index']);
        Route::post('/meetings/{meeting}/close', [MeetingController::class, 'close']);
        Route::get('/meetings/{meeting}/active-qr', [MeetingController::class, 'getActiveQr']);
        Route::get('/meetings/{meeting}/report', [MeetingController::class, 'report']);
        Route::get('/meetings/{meeting}/rekap', [MeetingController::class, 'rekap']);
        Route::post('/meetings/{meeting}/qr',    [MeetingController::class, 'generateQrToken']);
    });
});