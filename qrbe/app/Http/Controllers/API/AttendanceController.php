<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\QrSession;
use App\Models\MeetingToken;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    // B. Praktikan melakukan pemindaian QR
    public function checkin(Request $r)
    {
        $data = $r->validate(['qr_token' => 'required|string']);

        $user = $r->user();
        $member = $user?->member;

        if (!$member || $user->role !== 'praktikan') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Praktikan.'], 403);
        }

        // 1. Validasi Token QR dan Waktu
        $activeToken = MeetingToken::where('token', $data['qr_token'])
            ->where('expires_at', '>', now())
            ->first();

        if (!$activeToken) {
            return response()->json(['message' => 'Absensi Gagal! Token QR tidak valid atau sudah kedaluwarsa.'], 422);
        }
        
        $meetingId = $activeToken->meeting_id;

        // 2. Validasi Kehadiran (sudah absen di pertemuan ini?)
        $alreadyAttended = Attendance::where('member_id', $member->id)
            ->where('meeting_id', $meetingId)
            ->exists();

        if ($alreadyAttended) {
            return response()->json(['message' => 'Anda sudah berhasil absen di pertemuan ini.'], 200);
        }

        // 3. Simpan data absensi
        Attendance::create([
            'member_id' => $member->id,
            'meeting_id' => $meetingId,
            'checked_in_at' => now(),
        ]);

        return response()->json([
            'message' => 'Absensi praktikum berhasil dicatat!',
            'meeting_id' => $meetingId
        ], 200);
    }
    
    // Praktikan dapat melihat riwayat presensinya di dashboard
    public function history(Request $r)
    {
        $member = $r->user()->member;
        if (!$member) {
            return response()->json(['message' => 'Tidak ada data member'], 404);
        }
        
        return Attendance::where('member_id', $member->id)
            ->with('meeting')
            ->orderByDesc('id')
            ->get();
    }
}