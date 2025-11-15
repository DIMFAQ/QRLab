<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\QrSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Models\User; // <-- PASTIKAN User DI-IMPORT

class AdminController extends Controller
{

    public function getPendingUsers(Request $request)
    {
        // Cari semua user 'praktikan' yang email_verified_at nya masih null
        $pendingUsers = User::where('role', 'praktikan')
                            ->whereNull('email_verified_at')
                            ->with('member') // Ambil data member (NPM, Nama)
                            ->orderBy('created_at', 'asc') // Tampilkan yang paling lama mendaftar
                            ->get();

        return response()->json($pendingUsers);
    }

    /**
     * Menyetujui (memverifikasi) seorang user
     * POST /api/admin/users/{id}/approve
     */
    public function approveUser(Request $request, $id)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'User sudah terverifikasi'], 400);
        }

        // Setujui user dengan mengisi tanggal verifikasi
        $user->email_verified_at = now();
        $user->save();

        return response()->json(['message' => 'User ' . $user->name . ' berhasil disetujui.']);
    }

    // --- FUNGSI BARU DITAMBAHKAN UNTUK MENIRU DIMFAQ ---

    public function generateGlobalQrToken(Request $request)
    {
        // HANYA hapus sesi QR global sebelumnya (meeting_id = null)
        // Ini tidak akan mengganggu QR spesifik per-meeting
        QrSession::whereNull('meeting_id')->delete();

        $token = Str::random(12); // Mengikuti panjang token DIMFAQ
        $expiry = now()->addMinutes(10); // Mengikuti durasi DIMFAQ

        // Buat sesi QR baru TANPA meeting_id (menandakan ini sesi global)
        $qrSession = QrSession::create([
            'token' => $token,
            'expires_at' => $expiry,
            'meeting_id' => null, // Ini adalah pembedanya
        ]);

        // Simpan di cache (opsional, 'global' sbg pembeda dari meeting_id)
        Cache::put('qr_token_' . $token, 'global', $expiry);

        // Format response disamakan dengan AdminController DIMFAQ
        return response()->json([
            'message' => 'Sesi QR Code global berhasil dibuat.',
            'qr_token' => $qrSession->token,
            'expires_at' => $qrSession->expires_at->toDateTimeString(),
        ], 201);
    }

    public function getActiveGlobalQrToken(Request $request)
    {
        // Cari sesi QR global (meeting_id = null) yang masih aktif
        $session = QrSession::where('expires_at', '>', now())
                            ->whereNull('meeting_id')
                            ->first();

        if (!$session) {
            // Response 404 ini yang diharapkan oleh frontend AdminQrManager.jsx
            return response()->json(['message' => 'Tidak ada sesi QR yang aktif saat ini.'], 404);
        }

        // Format response disamakan dengan yang diharapkan AdminQrManager.jsx
        return response()->json([
            'qr_token' => $session->token,
            'expires_at' => $session->expires_at->toDateTimeString(),
            'minutes_left' => now()->diffInMinutes($session->expires_at)
        ]);
    }
}