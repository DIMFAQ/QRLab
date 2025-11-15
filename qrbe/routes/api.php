<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\MeetingController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\PraktikanController;
use App\Http\Controllers\API\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rute publik (Auth)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Rute terproteksi (harus login)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rute Praktikan
    Route::post('/praktikan/check-in', [AttendanceController::class, 'checkIn']);
    Route::get('/praktikan/history', [PraktikanController::class, 'getAttendanceHistory']);
    Route::get('/praktikan/meetings', [PraktikanController::class, 'getActiveMeetings']);
});

// Rute Admin (terproteksi + cek role admin)
// [FIX] Menggunakan prefix('admin') agar rapi seperti dimfaq
Route::prefix('admin')->middleware(['auth:sanctum', 'is_admin'])->group(function () { 

    // === Rute Manajemen Meeting (Arahkan ke MeetingController) ===
    
    // [FIX] Tambahkan rute POST untuk membuat meeting (store)
    Route::post('/meetings', [MeetingController::class, 'store']);
    
    // [FIX] Arahkan GET meetings ke MeetingController@index
    Route::get('/meetings', [MeetingController::class, 'index']);
    
    // [FIX] Gunakan {meeting} untuk parameter agar Model Binding bekerja
    // Arahkan semua rute lain ke MeetingController
    Route::post('/meetings/{meeting}/close', [MeetingController::class, 'close']);
    Route::get('/meetings/{meeting}/active-qr', [MeetingController::class, 'getActiveQr']);
    Route::get('/meetings/{meeting}/report', [MeetingController::class, 'report']);
    Route::get('/meetings/{meeting}/rekap', [MeetingController::class, 'rekap']);
    Route::post('/meetings/{meeting}/qr', [MeetingController::class, 'generateQrToken']);

    // Rute {id} lama yang menunjuk ke AdminController (jika masih dipakai FE)
    // Sebaiknya FE diupdate agar tidak pakai ini lagi
    // Route::get('/meetings/{id}', [AdminController::class, 'getMeetingDetails']); 
    // Route::get('/meetings/{id}/attendance', [AdminController::class, 'getMeetingAttendance']);

    
    // === Rute Verifikasi User (Ini sudah benar di AdminController) ===
    Route::get('/users/pending', [AdminController::class, 'getPendingUsers']);
    Route::post('/users/{id}/approve', [AdminController::class, 'approveUser']);
});

// Rute verifikasi email (jika diperlukan nanti)
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->middleware(['auth:sanctum', 'signed'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');