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
    
    Route::post('/meetings', [MeetingController::class, 'store']);
    Route::get('/meetings', [MeetingController::class, 'index']);
    
    Route::post('/meetings/{meeting}/close', [MeetingController::class, 'close']);
    Route::get('/meetings/{meeting}/active-qr', [MeetingController::class, 'getActiveQr']);
    Route::get('/meetings/{meeting}/rekap', [MeetingController::class, 'rekap']);
    Route::post('/meetings/{meeting}/qr', [MeetingController::class, 'generateQrToken']); // Ini mungkin tidak terpakai jika 'store' sdh generate QR

    // --- [BARU] RUTE UNTUK "BUKA ULANG" ---
    // Ini adalah endpoint yang dipanggil frontend saat tombol "Buka Ulang" diklik
    Route::post('/meetings/{meeting}/reopen', [MeetingController::class, 'reopen']);


    // === Rute Verifikasi User (Ini sudah benar di AdminController) ===
    Route::get('/users/pending', [AdminController::class, 'getPendingUsers']);
    Route::post('/users/{id}/approve', [AdminController::class, 'approveUser']);

    // --- [BARU] RUTE CRUD MAHASISWA ---
    Route::get('/users', [AdminController::class, 'getAllPraktikan']); // Ambil daftar
    Route::post('/users', [AdminController::class, 'storePraktikan']); // Simpan (Tambah)
    // (Opsional) Rute untuk tombol Edit/Hapus
    Route::put('/users/{user}', [AdminController::class, 'updatePraktikan']);
    Route::delete('/users/{user}', [AdminController::class, 'deletePraktikan']);
});

// Rute verifikasi email (jika diperlukan nanti)
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->middleware(['auth:sanctum', 'signed'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');