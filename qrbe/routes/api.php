<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\MeetingController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\PraktikanController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\EnrollmentController;
use App\Http\Controllers\API\MasterDataController;
use App\Http\Controllers\API\ProfileController;

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

    // Rute Profile (Admin & Praktikan)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/photo', [ProfileController::class, 'uploadPhoto']);
    Route::delete('/profile/photo', [ProfileController::class, 'deletePhoto']);

// Rute Praktikan
    Route::post('/praktikan/check-in', [AttendanceController::class, 'checkIn']);
    Route::get('/praktikan/history', [PraktikanController::class, 'getAttendanceHistory']); 
    Route::get('/praktikan/meetings', [PraktikanController::class, 'getActiveMeetings']);
    Route::get('/praktikan/jadwal', [PraktikanController::class, 'getSchedule']);
    
    // Rute tambahan dari QRLab
    Route::get('/praktikan/me', [PraktikanController::class, 'me']);
    Route::put('/praktikan/me', [PraktikanController::class, 'update']);
    Route::get('/praktikan/riwayat', [PraktikanController::class, 'riwayat']);
});

// Rute Admin (terproteksi + cek role admin)
Route::prefix('admin')->middleware(['auth:sanctum', 'is_admin'])->group(function () { 

    // === Rute Manajemen Meeting (TETAP ADA) ===
    Route::post('/meetings', [MeetingController::class, 'store']);
    Route::get('/meetings', [MeetingController::class, 'index']);
    Route::post('/meetings/{meeting}/close', [MeetingController::class, 'close']);
    Route::get('/meetings/{meeting}/active-qr', [MeetingController::class, 'getActiveQr']);
    Route::get('/meetings/{meeting}/rekap', [MeetingController::class, 'rekap']);
    Route::post('/meetings/{meeting}/qr', [MeetingController::class, 'generateQrToken']); 
    Route::post('/meetings/{meeting}/reopen', [MeetingController::class, 'reopen']);

    // === Rute Verifikasi User (TETAP ADA) ===
    Route::get('/users/pending', [AdminController::class, 'getPendingUsers']);
    Route::post('/users/{id}/approve', [AdminController::class, 'approveUser']);

    // === [FIX] RUTE CRUD MAHASISWA ===
    // Nama fungsi ini sudah benar sesuai AdminController di atas
    Route::get('/users', [AdminController::class, 'getMahasiswa']);
    Route::post('/users', [AdminController::class, 'storePraktikan']);
    Route::put('/users/{id}', [AdminController::class, 'updatePraktikan']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteMahasiswa']);

    // === RUTE STATS DASHBOARD ===
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/stats/weekly', [AdminController::class, 'weeklyStats']);

    // === RUTE PASSWORD RESET APPROVAL ===
    Route::get('/pending-password-resets', [AuthController::class, 'getPendingPasswordResets']);
    Route::post('/approve-password-reset/{userId}', [AuthController::class, 'approvePasswordReset']);
    Route::post('/reject-password-reset/{userId}', [AuthController::class, 'rejectPasswordReset']);

    // === RUTE MASTER DATA ===
    Route::get('/courses', [MasterDataController::class, 'getCourses']);
    Route::post('/courses', [MasterDataController::class, 'storeCourse']);
    Route::put('/courses/{id}', [MasterDataController::class, 'updateCourse']);
    Route::delete('/courses/{id}', [MasterDataController::class, 'deleteCourse']);
    
    Route::get('/classes', [MasterDataController::class, 'getClasses']);
    Route::post('/classes', [MasterDataController::class, 'storeClass']);

    // === RUTE ENROLLMENT (Kelola Pendaftaran Mahasiswa ke Praktikum-Kelas) ===
    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::post('/enrollments', [EnrollmentController::class, 'store']);
    Route::delete('/enrollments/{id}', [EnrollmentController::class, 'destroy']);
    Route::get('/members/{memberId}/enrollments', [EnrollmentController::class, 'getMemberEnrollments']);
});

// Rute verifikasi email
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->middleware(['auth:sanctum', 'signed'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');