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
    // GET /api/admin/meetings
    public function getAllMeetings()
    {
        $meetings = Meeting::withCount('attendances')->get();
        return response()->json($meetings);
    }

    // GET /api/admin/meetings/{id}
    public function getMeetingDetails($id)
    {
        $meeting = Meeting::with('attendances.member')->findOrFail($id);
        return response()->json($meeting);
    }

    // POST /api/admin/meetings/{id}/generate-qr
    public function generateNewQrCode($id)
    {
        $meeting = Meeting::findOrFail($id);
        $token = Str::random(40);
        $expiresAt = now()->addMinutes(2); // QR code berlaku 2 menit

        // Simpan sesi QR baru
        QrSession::create([
            'meeting_id' => $meeting->id,
            'token' => $token,
            'expires_at' => $expiresAt,
        ]);

        // Simpan token di cache untuk validasi cepat
        Cache::put('qr_token_' . $token, $meeting->id, $expiresAt);

        return response()->json([
            'token' => $token,
            'expires_at' => $expiresAt->toIso8601String(),
        ]);
    }

    // GET /api/admin/meetings/{id}/attendance
    public function getMeetingAttendance($id)
    {
        $meeting = Meeting::findOrFail($id);
        $attendance = $meeting->attendances()->with('member')->get();

        return response()->json([
            'meeting' => $meeting,
            'attendance' => $attendance,
        ]);
    }

    // --- FUNGSI BARU UNTUK VERIFIKASI ADMIN ---

    /**
     * Mengambil semua user yang belum diverifikasi (antrian)
     * GET /api/admin/users/pending
     */
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
}