<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\MeetingToken;
use App\Models\User; // <-- Pastikan ini ada
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MeetingController extends Controller
{
    /**
     * [WAJIB DIPERBAIKI] Mengambil semua meeting (Daftar Sesi)
     * GET /api/admin/meetings
     * * Fungsi ini sekarang berisi LOGIKA AUTO-CLOSE.
     */
    public function index()
    {
        // Ambil semua meeting, urutkan dari yang terbaru
        // withCount('attendances') untuk menghitung jumlah hadir
        $meetings = Meeting::withCount('attendances')
                           ->orderBy('created_at', 'desc')
                           ->get();

        // --- [LOGIKA PENTING UNTUK AUTO-CLOSE] ---
        // Cek setiap meeting yang statusnya masih 'open'
        foreach ($meetings->where('is_open', true) as $meeting) {
            
            // Cek: Apakah ada token aktif (belum kadaluarsa) untuk meeting ini?
            // Kita cek relasi 'tokens'
            $hasActiveToken = $meeting->tokens()
                                      ->where('expires_at', '>', now())
                                      ->exists(); //

            // Jika TIDAK ADA token aktif, tapi status meeting masih 'is_open'
            if (!$hasActiveToken) {
                // Maka, tutup sesi ini secara otomatis
                $meeting->is_open = false; //
                $meeting->save();
            }
        }
        // --- Selesai Logika Auto-Close ---

        // Kembalikan data meeting yang sudah di-update
        return response()->json($meetings);
    }

    /**
     * Membuat Sesi Meeting baru (dari modal "Buat Sesi Baru")
     * POST /api/admin/meetings
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'meeting_number' => 'required|integer|min:1',
            'qr_duration_minutes' => 'required|integer|min:1|max:60',
        ]);

        $meeting = Meeting::create([
            'name' => $request->name,
            'meeting_number' => $request->meeting_number,
            'qr_duration_minutes' => $request->qr_duration_minutes,
            'is_open' => true, // Langsung buka sesinya
            'user_id' => auth()->id(), // Simpan siapa admin yg buat
        ]);

        // Buat QR Token pertama untuk sesi ini
        $expiry = now()->addMinutes($request->qr_duration_minutes);
        $token = $meeting->tokens()->create([
            'token' => Str::random(40),
            'expires_at' => $expiry, //
        ]);

        // Kembalikan data QR aktif (sesuai format frontend)
        return response()->json([
            'meeting_id' => $meeting->id,
            'qr_token' => $token->token,
            'expires_at' => $token->expires_at->toDateTimeString(),
        ], 201);
    }

    /**
     * [FUNGSI BARU] Membuka ulang Sesi yang sudah ditutup
     * POST /api/admin/meetings/{meeting}/reopen
     */
    public function reopen(Meeting $meeting)
    {
        // Durasi ambil dari data meeting, atau default 5 menit
        $duration = $meeting->qr_duration_minutes ?? 5; 
        $expiry = now()->addMinutes($duration);

        // Buat token BARU
        $token = $meeting->tokens()->create([
            'token' => Str::random(40),
            'expires_at' => $expiry, //
        ]);

        // Set status meeting kembali 'open'
        $meeting->is_open = true; //
        $meeting->save();

        // Kembalikan data QR aktif (sesuai format frontend)
        return response()->json([
            'meeting_id' => $meeting->id,
            'qr_token' => $token->token,
            'expires_at' => $token->expires_at->toDateTimeString(),
        ], 201);
    }


    /**
     * Mengambil QR Aktif untuk 1 meeting (Tampilkan QR)
     * GET /api/admin/meetings/{meeting}/active-qr
     */
    public function getActiveQr(Meeting $meeting)
    {
        // Cari token terbaru yang belum kadaluarsa
        $token = $meeting->tokens()
                         ->where('expires_at', '>', now()) //
                         ->latest()
                         ->first();

        if (!$token) {
            return response()->json(['message' => 'Tidak ada QR yang aktif untuk sesi ini.'], 404);
        }

        // Kembalikan data QR aktif (sesuai format frontend)
        return response()->json([
            'meeting_id' => $meeting->id,
            'qr_token' => $token->token,
            'expires_at' => $token->expires_at->toDateTimeString(),
        ]);
    }

    /**
     * Menutup Sesi secara manual (via countdown timer atau tombol)
     * POST /api/admin/meetings/{meeting}/close
     */
    public function close(Meeting $meeting)
    {
        $meeting->is_open = false; //
        $meeting->save();

        // Optional: Batalkan semua token aktif agar tidak bisa dipakai lagi
        $meeting->tokens()
                ->where('expires_at', '>', now())
                ->update(['expires_at' => now()]); // Set kadaluarsa ke "sekarang"

        return response()->json(['message' => 'Sesi berhasil ditutup.']);
    }

    /**
     * Mengambil rekap absensi untuk 1 meeting (Modal Lihat Rekap)
     * GET /api/admin/meetings/{meeting}/rekap
     */
    public function rekap(Meeting $meeting)
    {
        // Ambil data absensi, join dengan user, lalu join dengan member
        $attendances = $meeting->attendances()
                              ->with(['user.member']) // Eager load user dan member
                              ->get();

        $rekap = $attendances->map(function ($att) {
            return [
                'name' => $att->user->member->name ?? $att->user->name, // Prioritaskan nama member
                'npm' => $att->user->member->npm ?? 'N/A', //
                'status' => $att->status, // 'Hadir'
                'time' => $att->created_at->toTimeString(),
            ];
        });

        return response()->json($rekap);
    }

    // --- FUNGSI BARU UNTUK HALAMAN REKAP ABSENSI (FILTER) ---

    /**
     * [BARU] Mengambil daftar nama meeting yang unik
     * GET /api/admin/rekap/meeting-names
     */
    public function getUniqueMeetingNames()
    {
        $names = Meeting::select('name')
                        ->distinct()
                        ->orderBy('name')
                        ->pluck('name');
        return response()->json($names);
    }

    /**
     * [BARU] Mengambil daftar nomor pertemuan berdasarkan nama
     * GET /api/admin/rekap/meeting-numbers
     */
    public function getMeetingNumbersByName(Request $request)
    {
        $request->validate(['name' => 'required|string']);
        
        $numbers = Meeting::where('name', $request->name)
                          ->select('meeting_number')
                          ->distinct()
                          ->orderBy('meeting_number')
                          ->pluck('meeting_number');
        return response()->json($numbers);
    }

    /**
     * [BARU] Fungsi inti untuk filter rekap absensi
     * GET /api/admin/rekap/filter
     */
    public function filterRekap(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'number' => 'required|integer',
        ]);

        // 1. Cari meeting yang sesuai
        $meeting = Meeting::where('name', $request->name)
                           ->where('meeting_number', $request->number)
                           ->first();

        if (!$meeting) {
            return response()->json(['message' => 'Meeting tidak ditemukan'], 404);
        }

        // 2. Ambil semua praktikan yang terdaftar
        // Asumsi: semua user dengan role 'praktikan' adalah peserta
        $allPraktikan = User::where('role', 'praktikan')
                            ->with('member') // Ambil data NPM & Nama
                            ->get();

        // 3. Ambil data absensi untuk meeting ini
        $attendances = $meeting->attendances()
                              ->with('user')
                              ->get()
                              ->keyBy('user_id'); // Jadikan user_id sebagai key

        $rekap = [];

        // 4. Looping semua praktikan, cek satu per satu
        foreach ($allPraktikan as $praktikan) {
            $npm = $praktikan->member->npm ?? $praktikan->email; //
            $name = $praktikan->member->name ?? $praktikan->name; //

            // Cek apakah praktikan ini ada di daftar hadir
            if ($attendances->has($praktikan->id)) {
                $att = $attendances->get($praktikan->id);
                $rekap[] = [
                    'npm' => $npm,
                    'name' => $name,
                    'status' => $att->status, // 'Hadir' atau 'Terlambat'
                    'scan_time' => $att->created_at->format('H:i:s \W\I\B'),
                ];
            } else {
                // Jika tidak ada di daftar hadir
                $rekap[] = [
                    'npm' => $npm,
                    'name' => $name,
                    'status' => 'Alpa', // Sesuai desain
                    'scan_time' => null,
                ];
            }
        }

        // Urutkan berdasarkan NPM
        $rekap = collect($rekap)->sortBy('npm')->values();

        return response()->json($rekap);
    }
}