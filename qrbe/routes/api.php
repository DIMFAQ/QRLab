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
Route::middleware(['auth:sanctum', 'is_admin'])->group(function () {
    Route::get('/admin/meetings', [AdminController::class, 'getAllMeetings']);
    Route::get('/admin/meetings/{id}', [AdminController::class, 'getMeetingDetails']);
    Route::post('/admin/meetings/{id}/generate-qr', [AdminController::class, 'generateNewQrCode']);
    Route::get('/admin/meetings/{id}/attendance', [AdminController::class, 'getMeetingAttendance']);

    // --- RUTE BARU UNTUK VERIFIKASI ADMIN ---
    Route::get('/admin/users/pending', [AdminController::class, 'getPendingUsers']);
    Route::post('/admin/users/{id}/approve', [AdminController::class, 'approveUser']);
});

// Rute verifikasi email (jika diperlukan nanti)
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->middleware(['auth:sanctum', 'signed'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');