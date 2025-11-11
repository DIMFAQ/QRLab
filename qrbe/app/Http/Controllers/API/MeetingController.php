<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\MeetingToken;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Attendance;
use App\Models\Member;
use Carbon\Carbon;

class MeetingController extends Controller
{
    // Mengambil daftar pertemuan (untuk Admin)
    public function index()
    {
        return Meeting::withCount('attendances')->orderByDesc('id')->get();
    }

    private function parseDateTime($value): Carbon
    {
    // Terima 2 format: HTML datetime-local (YYYY-MM-DDTHH:mm) dan dd/MM/YYYY HH:mm
        foreach (['Y-m-d\TH:i', 'd/m/Y H:i'] as $fmt) {
            try { return Carbon::createFromFormat($fmt, $value); } catch (\Throwable $e) {}
        }
        // fallback
        return Carbon::parse($value);
    }

    // A. Membuat sesi pertemuan baru
    public function store(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:255',
            'meeting_number' => 'required|integer|min:1',
            'qr_duration_minutes' => 'required|integer|min:1',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        $start = $this->parseDateTime($data['start_time']);
        $end   = $this->parseDateTime($data['end_time']);
        $dur   = (int) $data['qr_duration_minutes']; // <<– penting: cast ke int

        if ($end->lte($start)) {
            return response()->json(['message' => 'Waktu selesai harus setelah waktu mulai.'], 422);
        }
        $expiresAt = $start->copy()->addMinutes($dur);

        $meeting = Meeting::create([
            ...$data,
            'user_id' => $r->user()->id,
            'is_open' => true,
        ]);

        // Langsung generate token saat dibuat
        return $this->generateQrToken($meeting);
    }

    // Menghasilkan Token QR untuk pertemuan tertentu
    public function generateQrToken(Meeting $meeting)
    {
        if (!$meeting->is_open) {
             return response()->json(['message' => 'Pertemuan sudah ditutup'], 400);
        }

        $token = Str::random(10);
        $expiry = now()->addMinutes($meeting->qr_duration_minutes);

        // Hapus token lama untuk pertemuan ini (jika ada)
        $meeting->tokens()->delete(); 

        $qrToken = MeetingToken::create([
            'meeting_id' => $meeting->id,
            'token' => $token,
            'expires_at' => $expiry,
        ]);

        return response()->json([
            'message' => 'QR Token berhasil di-generate ulang.',
            'qr_token' => $qrToken->token,
            'expires_at' => $qrToken->expires_at->toDateTimeString(),
            'meeting_id' => $meeting->id,
        ], 201);
    }

    public function getActiveQr(Meeting $meeting)
    {
        // Cari token yang aktif untuk meeting ini
        $qrToken = MeetingToken::where('meeting_id', $meeting->id)
            ->where('expires_at', '>', now())
            ->first();

        if (!$qrToken) {
            return response()->json(['message' => 'Tidak ada token QR aktif'], 404);
        }

        return response()->json([
            'qr_token' => $qrToken->token,
            'expires_at' => $qrToken->expires_at->toDateTimeString(),
            'meeting_id' => $meeting->id,
        ]);
    }
    // Admin menutup sesi presensi
    public function close(Meeting $meeting)
    {
        if (!$meeting->is_open) {
            return response()->json(['message' => 'Pertemuan sudah tertutup'], 400);
        }

        $meeting->update(['is_open' => false]);
        $meeting->tokens()->delete(); // Hapus token aktif

        return response()->json(['message' => 'Sesi presensi berhasil ditutup.']);
    }

    // Admin meninjau & mengekspor rekap kehadiran
    public function report(Meeting $meeting)
    {
        // Poin A: Admin meninjau & mengekspor rekap kehadiran.
        // Untuk sederhana, kita kembalikan data attendance dalam JSON.
        return $meeting->attendances()->with('member')->get();
    }

    public function rekap(Meeting $meeting)
    {
        // Ambil semua member (atau batasi sesuai kelas/kelompok jika kamu punya relasinya)
        $members = Member::query()
            ->leftJoin('attendances', function ($q) use ($meeting) {
                $q->on('attendances.member_id', '=', 'members.id')
                ->where('attendances.meeting_id', $meeting->id);
            })
            ->orderBy('members.name')
            ->get([
                'members.id as member_id',
                'members.name',
                'attendances.id as attendance_id'
            ]);

        $rekap = $members->map(fn($m) => [
            'member_id' => $m->member_id,
            'name'      => $m->name,
            'status'    => $m->attendance_id ? 'Hadir' : 'Tidak Hadir',
        ]);

        return response()->json([
            'meeting_id' => $meeting->id,
            'rekap'      => $rekap,
        ]);
    }

}