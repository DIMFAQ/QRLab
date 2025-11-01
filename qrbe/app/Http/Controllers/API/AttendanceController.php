<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\QrSession;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function checkin(Request $r)
    {
        $data = $r->validate(['qr_token' => 'required|string']);
        $user = $r->user();
        $member = $user?->member; 

        if (!$member || $user->role !== 'praktikan') {
            return response()->json(['message' => 'Akses ditolak. Hanya Praktikan yang dapat absen.'], 403);
        }

        $activeSession = QrSession::where('token', $data['qr_token'])->where('expires_at', '>', now())->first();
        if (!$activeSession) {
            return response()->json(['message' => 'Absensi Gagal! Token QR tidak valid atau sesi sudah berakhir.'], 422);
        }

        $attendance = Attendance::where('member_id', $member->id)->whereDate('checked_in_at', today())->first();

        if ($attendance) {
            return response()->json(['message' => 'Anda sudah berhasil absen praktikum hari ini.'], 200);
        } else {
            $newAttendance = Attendance::create([
                'member_id' => $member->id,
                'checked_in_at' => now(),
            ]);
            $message = 'Absensi praktikum berhasil!';
        }

        return response()->json(['message' => $message, 'attendance' => $newAttendance], 200);
    }
}