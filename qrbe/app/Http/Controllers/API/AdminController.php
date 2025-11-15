<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\QrSession;
use App\Models\Meeting; // WAJIB: Import Model Meeting
use App\Models\Attendance; // WAJIB: Import Model Attendance
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    // --- FUNGSIONALITAS QR SESSION (SUDAH ADA) ---

    public function generateQrToken(Request $r)
    {
        if ($r->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }
        
        // LOGIKA PERBAIKAN: Asumsi QR Token terkait dengan Meeting yang BARU DIBUAT/TERBUKA
        $meetingId = $r->input('meeting_id'); // Terima meeting_id dari Frontend
        $meeting = Meeting::find($meetingId);
        
        if (!$meeting) {
            return response()->json(['message' => 'Pertemuan tidak ditemukan.'], 404);
        }

        // Hapus sesi QR yang lama dan buat yang baru
        QrSession::truncate(); 
        $token = Str::random(12);
        $expiry = now()->addMinutes(10);
        
        $qrSession = QrSession::create([
            'token' => $token, 
            'expires_at' => $expiry, 
            'generated_by_user_id' => $r->user()->id,
            'meeting_id' => $meetingId, // Tambahkan relasi ke Meeting
        ]);

        return response()->json([
            'message' => 'Sesi QR Code berhasil dibuat.',
            'qr_token' => $qrSession->token,
            'expires_at' => $qrSession->expires_at->toDateTimeString(),
            'meeting_id' => $meetingId, // Kirim ID Meeting ke Frontend
        ], 201);
    }

    public function getActiveQrToken(Request $r)
    {
        if ($r->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }
        // Cek sesi yang aktif dan belum kadaluarsa
        $session = QrSession::where('expires_at', '>', now())->first();
        
        if (!$session) {
            return response()->json(['message' => 'Tidak ada sesi QR yang aktif saat ini.'], 404);
        }

        return response()->json([
            'qr_token' => $session->token,
            'expires_at' => $session->expires_at->toDateTimeString(),
            'minutes_left' => now()->diffInMinutes($session->expires_at),
            'meeting_id' => $session->meeting_id, // Kirim meeting_id
        ]);
    }

    // --- PERBAIKAN: ENDPOINT DAFTAR PERTEMUAN ADMIN (/admin/meetings) ---

    public function getMeetings(Request $r)
    {
        if ($r->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // WAJIB: Gunakan withCount untuk menghitung absensi yang up-to-date
        $meetings = Meeting::query()
            ->withCount('attendances') 
            ->orderBy('created_at', 'desc')
            ->get();

        // Mengembalikan array data sesuai ekspektasi AdminMeetings.jsx
        return response()->json(['data' => $meetings]);
    }
    
    // --- PERBAIKAN: ENDPOINT REKAP ABSENSI ADMIN (/admin/meetings/{id}/rekap) ---

    public function getRekap(Request $r, Meeting $meeting)
    {
        if ($r->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }
        
        // WAJIB: Eager load relasi 'user' melalui 'attendances'
        $attendances = $meeting->attendances()
                               ->with('user') 
                               ->get();

        // Normalisasi data untuk Frontend (sesuai yang di-map di AdminMeetings.jsx)
        $rekapData = $attendances->map(function ($attendance) {
            // Asumsi model Attendance memiliki relasi 'user'
            return [
                'name' => $attendance->user->name ?? 'User Unknown', 
                'nim' => $attendance->user->nim ?? '-', 
                'status' => 'Hadir', 
                'timestamp' => $attendance->created_at->toDateTimeString(),
            ];
        });

        // Mengembalikan array data rekap
        return response()->json(['data' => $rekapData]);
    }
    
    // --- TAMBAHAN: FUNGSI TUTUP SESI PRESENSI ---

    public function closeMeeting(Request $r, Meeting $meeting)
    {
        if ($r->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // Cari sesi QR aktif yang terkait dengan meeting ini
        QrSession::where('meeting_id', $meeting->id)->delete();
        
        // Update status meeting (jika Anda memiliki kolom is_open di tabel meetings)
        // $meeting->update(['is_open' => false]);

        return response()->json(['message' => 'Sesi presensi berhasil ditutup.']);
    }

}