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
        // Ambil input apa pun bentuknya
        $raw = $r->input('qr_token');

        // Normalisasi jadi string
        $token = null;
        if (is_string($raw)) {
            $token = trim($raw);
        } elseif (is_array($raw)) {
            $first = $raw[0] ?? $raw;
            $token = $first['text'] ?? $first['rawValue'] ?? $first['data'] ?? null;
        } elseif (is_object($raw)) {
            $token = $raw->text ?? $raw->rawValue ?? $raw->data ?? null;
        }

        // Kalau QR-nya ternyata JSON, ambil field qr_token
        if (is_string($token)) {
            try {
                $maybe = json_decode($token, true, 512, JSON_THROW_ON_ERROR);
                if (is_array($maybe) && isset($maybe['qr_token'])) {
                    $token = $maybe['qr_token'];
                }
            } catch (\Throwable $e) { /* abaikan */ }
        }

        if (!is_string($token) || $token === '') {
            return response()->json(['message' => 'QR token tidak valid.'], 422);
        }

        $user = $r->user();
        $member = $user?->member;

        if (!$member || $user->role !== 'praktikan') {
            return response()->json(['message' => 'Akses ditolak. Anda bukan Praktikan.'], 403);
        }

        // 1️⃣ Validasi Token QR dan Waktu
        $activeToken = \App\Models\MeetingToken::where('token', $token)
            ->where('expires_at', '>', now())
            ->first();

        if (!$activeToken) {
            return response()->json(['message' => 'Absensi Gagal! Token QR tidak valid atau sudah kedaluwarsa.'], 422);
        }

        $meetingId = $activeToken->meeting_id;

        // 2️⃣ Cek apakah mahasiswa terdaftar di praktikum/kelas meeting ini (enrollment aktif)
        $meeting = \App\Models\Meeting::with(['course', 'praktikumClass'])->find($meetingId);
        
        if (!$meeting) {
            return response()->json(['message' => 'Meeting tidak ditemukan.'], 404);
        }

        $enrollment = \App\Models\Enrollment::where('member_id', $member->id)
            ->where('course_id', $meeting->course_id)
            ->where('class_id', $meeting->class_id)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'message' => 'Anda tidak terdaftar di praktikum/kelas ini. Silakan hubungi admin.'
            ], 403);
        }

        if (!$enrollment->is_active) {
            return response()->json([
                'message' => 'Enrollment Anda tidak aktif. Silakan hubungi admin untuk mengaktifkan kembali.'
            ], 403);
        }

        // 3️⃣ Cek apakah sudah absen di pertemuan ini
        $alreadyAttended = \App\Models\Attendance::where('member_id', $member->id)
            ->where('meeting_id', $meetingId)
            ->exists();

        if ($alreadyAttended) {
            return response()->json(['message' => 'Anda sudah absen di pertemuan ini.'], 200);
        }

        // 4️⃣ Simpan data absensi dengan waktu UTC
        $checkedInAt = \Carbon\Carbon::now('Asia/Jakarta')->setTimezone('UTC');
        
        \App\Models\Attendance::create([
            'member_id' => $member->id,
            'meeting_id' => $meetingId,
            'checked_in_at' => $checkedInAt,
        ]);

        return response()->json([
            'message' => 'Absensi praktikum berhasil dicatat!',
            'meeting_id' => $meetingId
        ], 200);
    }
}