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
        ]);

        // Kirim email verifikasi
        event(new Registered($user));
        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Registrasi berhasil. Cek email untuk verifikasi akun.',
        ], 201);
    }

    // POST /api/login  (asumsikan sudah ada; kalau belum:)
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        /** @var \App\Models\User $user */
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Kredensial salah.'], 422);
        }

        // opsional: wajib verified untuk login
        // if (! $user->hasVerifiedEmail()) {
        //     return response()->json(['message' => 'Email belum terverifikasi.'], 403);
        // }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => [
                'id'    => $user->id,
                'email' => $user->email,
                'role'  => $user->role,
                'name'  => optional($user->member)->name,      // buat header FE gampang
                'npm'   => optional($user->member)->student_id, // optional info
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
            'email' => 'required|email|exists:users,email',
        ]);

        // Bikin token reset manual
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Tautan reset password telah dikirim ke email kamu.']);
        }

        return response()->json(['message' => __($status)], 400);
    }

    // POST /api/reset-password  body: { email, token, password, password_confirmation }
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }
        return response()->json(['message' => __($status)], 422);
    }

    // === Verifikasi Email ===

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
}
