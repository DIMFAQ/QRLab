<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Member;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // POST /api/register
    public function register(Request $request)
    {
        $data = $request->validate([
            'email'       => 'required|email:rfc,dns|unique:users,email',
            'name'        => 'required|string|max:100',
            'student_id'  => 'required|string|max:50',
            'password'    => ['required', 'confirmed', PasswordRule::min(8)], // butuh password_confirmation
        ]);

        // Buat member (menyimpan Nama & NPM)
        $member = Member::create([
            'name'       => $data['name'],
            'student_id' => $data['student_id'],
        ]);

        // Buat user prakikan
        $user = User::create([
            'name'      => $data['name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'role'       => 'praktikan',
            'member_id'  => $member->id,
            // email_verified_at sengaja dibiarkan NULL
        ]);

        // Pesan diubah untuk memberitahu user agar menunggu persetujuan
        return response()->json([
            'message' => 'Registrasi berhasil. Akun Anda sedang menunggu persetujuan Admin.',
        ], 201);
    }

    // POST /api/login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        /** @var \App\Models\User $user */
        $user = User::where('email', $credentials['email'])->first();

        if (! $user) {
            return response()->json(['message' => 'Kredensial salah.'], 422);
        }

        // Cek apakah ada password reset pending
        if ($user->password_reset_pending) {
            // Jika ada temp_password, cek juga dengan password baru
            $passwordMatch = Hash::check($credentials['password'], $user->password);
            if ($user->temp_password) {
                $passwordMatch = $passwordMatch || Hash::check($credentials['password'], $user->temp_password);
            }

            if (!$passwordMatch) {
                return response()->json(['message' => 'Kredensial salah.'], 422);
            }

            return response()->json([
                'message' => 'Password reset sedang menunggu persetujuan admin. Silakan hubungi admin untuk mengaktifkan akun Anda.'
            ], 403);
        }

        // Cek password untuk user yang tidak pending
        if (! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Kredensial salah.'], 422);
        }

        // --- INI PERBAIKANNYA ---
        // Wajib verified (disetujui admin) untuk login, TAPI HANYA UNTUK PRAKTIKAN
        if ($user->role === 'praktikan' && ! $user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Akun Anda belum disetujui oleh Admin.'], 403);
        }
        
        // Baris `$token = ...` yang hilang sudah dikembalikan
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => [
                'id'    => $user->id,
                'email' => $user->email,
                'role'  => $user->role,
                'name'  => optional($user->member)->name,
                'npm'   => optional($user->member)->student_id,
            ],
            'token' => $token,
        ]);
    }

    // GET /api/me
    public function me(Request $request)
    {
        $u = $request->user();
        return response()->json([
            'id'    => $u->id,
            'email' => $u->email,
            'role'  => $u->role,
            'name'  => optional($u->member)->name,
            'npm'   => optional($u->member)->student_id,
            'email_verified' => $u->hasVerifiedEmail(),
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    // === Lupa Password ===

    // POST /api/forgot-password  body: { email }
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Cek apakah email terdaftar
        if (!$user) {
            return response()->json([
                'message' => 'Email tidak terdaftar dalam sistem.'
            ], 404);
        }

        // Cek apakah user adalah admin (admin tidak bisa reset password sendiri)
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Admin tidak dapat mereset password melalui fitur ini. Hubungi super admin.'
            ], 403);
        }

        return response()->json([
            'message' => 'Email ditemukan. Silakan buat password baru.',
            'email' => $request->email
        ]);
    }

    // POST /api/reset-password  body: { email, password, password_confirmation }
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email|exists:users,email',
            'password'              => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        // Cek apakah user adalah admin
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Admin tidak dapat mereset password melalui fitur ini.'
            ], 403);
        }

        // Simpan password baru ke temp_password dan set flag pending
        $user->temp_password = Hash::make($request->password);
        $user->password_reset_pending = true;
        $user->email_verified_at = null; // Set ke null untuk menandakan pending approval
        $user->save();

        return response()->json([
            'message' => 'Password baru berhasil dibuat. Menunggu persetujuan admin untuk mengaktifkan akun Anda.'
        ]);
    }

    // === Verifikasi Email (Tidak terpakai di alur ini, tapi biarkan saja) ===

    // GET /api/email/verify/{id}/{hash}
    public function verify(EmailVerificationRequest $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Sudah terverifikasi.']);
        }

        $request->fulfill(); // set email_verified_at

        return response()->json(['message' => 'Email berhasil diverifikasi.']);
    }

    // POST /api/email/verification-notification
    public function resendVerification(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah terverifikasi.'], 400);
        }

        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Link verifikasi dikirim.']);
    }


    // === Admin Password Reset Approval ===

    // GET /api/admin/pending-password-resets - Ambil semua user dengan password_reset_pending
    public function getPendingPasswordResets(Request $request)
    {
        // Pastikan yang akses adalah admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin only.'], 403);
        }

        $pendingUsers = User::where('password_reset_pending', true)
            ->select('id', 'name', 'email', 'role', 'updated_at')
            ->get();

        return response()->json([
            'pending_resets' => $pendingUsers
        ]);
    }

    // POST /api/admin/approve-password-reset/{userId} - Approve password reset
    public function approvePasswordReset(Request $request, $userId)
    {
        // Pastikan yang akses adalah admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin only.'], 403);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        if (!$user->password_reset_pending) {
            return response()->json(['message' => 'User tidak memiliki password reset pending.'], 400);
        }

        // Pindahkan temp_password ke password dan reset flag
        $user->password = $user->temp_password;
        $user->temp_password = null;
        $user->password_reset_pending = false;
        $user->email_verified_at = now(); // Aktifkan kembali akun agar bisa login
        $user->save();

        return response()->json([
            'message' => 'Password reset disetujui. Akun user telah diaktifkan dan dapat login dengan password baru.'
        ]);
    }

    // POST /api/admin/reject-password-reset/{userId} - Reject password reset
    public function rejectPasswordReset(Request $request, $userId)
    {
        // Pastikan yang akses adalah admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin only.'], 403);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        if (!$user->password_reset_pending) {
            return response()->json(['message' => 'User tidak memiliki password reset pending.'], 400);
        }

        // Hapus temp_password, reset flag, dan aktifkan kembali akun
        $user->temp_password = null;
        $user->password_reset_pending = false;
        $user->email_verified_at = now(); // Aktifkan kembali akun agar bisa login dengan password lama
        $user->save();

        return response()->json([
            'message' => 'Password reset ditolak. Akun user telah diaktifkan dan dapat login dengan password lama.'
        ]);
    }
}
