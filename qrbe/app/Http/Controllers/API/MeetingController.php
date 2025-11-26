<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\MeetingToken;
use App\Models\QrSession;
use App\Models\User; // <-- Pastikan ini ada
use Illuminate\Support\Carbon;
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
        // Ambil semua meeting dengan relasi course dan class
        $meetings = Meeting::with(['course', 'praktikumClass', 'admin'])
                           ->withCount('attendances')
                           ->orderBy('created_at', 'desc')
                           ->get();

        // --- [LOGIKA PENTING UNTUK AUTO-CLOSE] ---
        foreach ($meetings->where('is_open', true) as $meeting) {
            $hasActiveToken = $meeting->tokens()
                                      ->where('expires_at', '>', now())
                                      ->exists();

            if (!$hasActiveToken) {
                $meeting->is_open = false;
                $meeting->save();
            }
        }
        // --- Selesai Logika Auto-Close ---

        // Format response dengan data course dan class
        $result = $meetings->map(function ($meeting) {
            // Hitung total mahasiswa yang enrolled di course + class ini
            $totalEnrolled = \App\Models\Enrollment::where('course_id', $meeting->course_id)
                ->where('class_id', $meeting->class_id)
                ->where('is_active', true)
                ->count();
            
            // Hitung mahasiswa unik yang hadir (bukan total attendance)
            $uniqueAttendees = \App\Models\Attendance::where('meeting_id', $meeting->id)
                ->distinct('member_id')
                ->count('member_id');
            
            // Hitung persentase kehadiran
            $attendancePercentage = $totalEnrolled > 0 
                ? round(($uniqueAttendees / $totalEnrolled) * 100, 1)
                : 0;
            
            return [
                'id' => $meeting->id,
                'name' => $meeting->name,
                'course_id' => $meeting->course_id,
                'class_id' => $meeting->class_id,
                'course_name' => $meeting->course?->name,
                'class_name' => $meeting->praktikumClass?->name,
                'meeting_number' => $meeting->meeting_number,
                'start_time' => $meeting->start_time,
                'end_time' => $meeting->end_time,
                'qr_duration_minutes' => $meeting->qr_duration_minutes,
                'is_open' => $meeting->is_open,
                'attendances_count' => $uniqueAttendees, // Mahasiswa unik yang hadir
                'total_enrolled' => $totalEnrolled, // Total mahasiswa enrolled
                'attendance_percentage' => $attendancePercentage, // Persentase kehadiran
                'created_at' => $meeting->created_at,
                'updated_at' => $meeting->updated_at,
            ];
        });

        return response()->json($result);
    }

    /**
     * Membuat Sesi Meeting baru (dari modal "Buat Sesi Baru")
     * POST /api/admin/meetings
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'class_id' => 'required|exists:classes,id',
            'meeting_number' => 'required|integer|min:1',
            'qr_duration_minutes' => 'required|integer|min:1|max:60',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        // VALIDASI: Cek apakah pertemuan dengan course + class + meeting_number sudah ada
        $existingMeeting = Meeting::where('course_id', $validated['course_id'])
                                  ->where('class_id', $validated['class_id'])
                                  ->where('meeting_number', $validated['meeting_number'])
                                  ->first();

        if ($existingMeeting) {
            return response()->json([
                'message' => 'Pertemuan ke-' . $validated['meeting_number'] . ' untuk kelas ini sudah dibuat sebelumnya.',
                'existing_meeting' => $existingMeeting->name,
            ], 422);
        }

        // Ambil data course dan class untuk generate nama meeting
        $course = \App\Models\Course::findOrFail($validated['course_id']);
        $class = \App\Models\PraktikumClass::findOrFail($validated['class_id']);
        
        // Generate nama meeting otomatis: "Jaringan Komputer - Kelas A - Pertemuan 1"
        $meetingName = "{$course->name} - {$class->name} - Pertemuan {$validated['meeting_number']}";

        // Parse waktu dari frontend (Jakarta time) dan konversi ke UTC untuk disimpan
        $startTime = Carbon::parse($validated['start_time'], 'Asia/Jakarta')->setTimezone('UTC');
        $endTime = Carbon::parse($validated['end_time'], 'Asia/Jakarta')->setTimezone('UTC');

        $meeting = Meeting::create([
            'name' => $meetingName,
            'course_id' => $validated['course_id'],
            'class_id' => $validated['class_id'],
            'meeting_number' => $validated['meeting_number'],
            'start_time' => $startTime,
            'end_time' => $endTime,
            'qr_duration_minutes' => $validated['qr_duration_minutes'],
            'is_open' => false, // Meeting dibuat tapi belum dibuka (akan auto-start sesuai waktu)
            'user_id' => auth()->id(), // Simpan siapa admin yg buat
        ]);

        // Kembalikan data meeting yang baru dibuat
        return response()->json([
            'meeting_id' => $meeting->id,
            'meeting_name' => $meetingName,
            'message' => 'Meeting berhasil dijadwalkan. Sesi akan otomatis dimulai pada waktu yang ditentukan.',
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
     * Start meeting dan generate QR token pertama kali
     * POST /api/admin/meetings/{meeting}/qr
     */
    public function generateQrToken(Meeting $meeting)
    {
        // Set meeting menjadi open
        $meeting->is_open = true;
        $meeting->save();

        // Generate QR token baru
        $duration = $meeting->qr_duration_minutes ?? 5;
        $expiry = now()->addMinutes($duration);

        $token = $meeting->tokens()->create([
            'token' => Str::random(40),
            'expires_at' => $expiry,
        ]);

        return response()->json([
            'meeting_id' => $meeting->id,
            'qr_token' => $token->token,
            'expires_at' => $token->expires_at->toDateTimeString(),
            'message' => 'QR Code berhasil dibuat dan sesi dibuka.',
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
        // 1. Ambil semua member yang terdaftar di course + class meeting ini
        $enrolledMembers = \App\Models\Enrollment::where('course_id', $meeting->course_id)
                                                  ->where('class_id', $meeting->class_id)
                                                  ->where('is_active', true)
                                                  ->with('member')
                                                  ->get();

        // 2. Ambil data absensi untuk meeting ini
        $attendances = $meeting->attendances()
                              ->get()
                              ->keyBy('member_id'); // Jadikan member_id sebagai key

        $rekap = [];

        // 3. Looping semua member yang enrolled
        foreach ($enrolledMembers as $enrollment) {
            $member = $enrollment->member;
            
            if (!$member) continue; // Skip jika member tidak ada

            // Cek apakah member ini sudah absen
            if ($attendances->has($member->id)) {
                $att = $attendances->get($member->id);
                
                // Hitung status berdasarkan waktu scan
                $startTime = \Carbon\Carbon::parse($meeting->start_time);
                $scanTime = \Carbon\Carbon::parse($att->checked_in_at);
                $minutesLate = $startTime->diffInMinutes($scanTime, false);
                
                $status = $minutesLate <= 15 ? 'Hadir' : 'Terlambat';
                
                $rekap[] = [
                    'member' => [
                        'student_id' => $member->student_id,
                        'name' => $member->name,
                    ],
                    'checked_in_at' => $scanTime->timezone('Asia/Jakarta')->format('H.i.s') . ' WIB',
                    'status' => $status,
                ];
            } else {
                // Jika tidak ada di daftar hadir = ALPA
                $rekap[] = [
                    'member' => [
                        'student_id' => $member->student_id,
                        'name' => $member->name,
                    ],
                    'checked_in_at' => '-',
                    'status' => 'Alpa',
                ];
            }
        }

        // Urutkan berdasarkan NPM
        $rekap = collect($rekap)->sortBy('member.student_id')->values();

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

        // 2. Ambil semua member yang terdaftar di course + class meeting ini
        $enrolledMembers = \App\Models\Enrollment::where('course_id', $meeting->course_id)
                                                  ->where('class_id', $meeting->class_id)
                                                  ->where('is_active', true)
                                                  ->with('member')
                                                  ->get();

        // 3. Ambil data absensi untuk meeting ini
        $attendances = $meeting->attendances()
                              ->get()
                              ->keyBy('member_id'); // Jadikan member_id sebagai key

        $rekap = [];

        // 4. Looping semua member yang enrolled, cek satu per satu
        foreach ($enrolledMembers as $enrollment) {
            $member = $enrollment->member;
            
            if (!$member) continue; // Skip jika member tidak ada

            $npm = $member->student_id;
            $name = $member->name;

            // Cek apakah member ini sudah absen
            if ($attendances->has($member->id)) {
                $att = $attendances->get($member->id);
                
                // Hitung status berdasarkan waktu scan
                $startTime = \Carbon\Carbon::parse($meeting->start_time);
                $scanTime = \Carbon\Carbon::parse($att->checked_in_at);
                $minutesLate = $startTime->diffInMinutes($scanTime, false);
                
                $status = $minutesLate <= 15 ? 'Hadir' : 'Terlambat';
                
                $rekap[] = [
                    'npm' => $npm,
                    'name' => $name,
                    'status' => $status,
                    'scan_time' => $scanTime->timezone('Asia/Jakarta')->format('H.i.s') . ' WIB',
                ];
            } else {
                // Jika tidak ada di daftar hadir = ALPA
                $rekap[] = [
                    'npm' => $npm,
                    'name' => $name,
                    'status' => 'Alpa',
                    'scan_time' => '-',
                ];
            }
        }

        // Urutkan berdasarkan NPM
        $rekap = collect($rekap)->sortBy('npm')->values();

        return response()->json($rekap);
    }

    /**
     * Auto-start meetings based on scheduled time
     */
    public function autoStart(Request $request)
    {
        $now = Carbon::now('Asia/Jakarta');
        
        \Log::info('Auto-start check at Jakarta time: ' . $now->toDateTimeString());
        \Log::info('Auto-start check at UTC time: ' . $now->copy()->setTimezone('UTC')->toDateTimeString());
        
        // Find meetings that should be started
        // Konversi waktu ke UTC untuk perbandingan dengan database
        $nowUtc = $now->copy()->setTimezone('UTC');
        
        $meetingsToStart = Meeting::where('is_open', false)
            ->where('start_time', '<=', $nowUtc)
            ->where('end_time', '>', $nowUtc)
            ->get();

        \Log::info('Found ' . $meetingsToStart->count() . ' meetings to start');
        
        foreach ($meetingsToStart as $m) {
            \Log::info("Meeting #{$m->id}: start={$m->start_time}, end={$m->end_time}, is_open={$m->is_open}");
        }

        $started = [];

        foreach ($meetingsToStart as $meeting) {
            try {
                \Log::info("Starting meeting {$meeting->id}: {$meeting->name}");
                
                // Set meeting to open (sama seperti manual start)
                $meeting->is_open = true;
                $meeting->save();

                // Generate QR token (sama seperti manual start dengan MeetingToken)
                $duration = $meeting->qr_duration_minutes ?? 5;
                $expiresAt = Carbon::now('Asia/Jakarta')->addMinutes($duration);
                
                $token = $meeting->tokens()->create([
                    'token' => Str::random(40),
                    'expires_at' => $expiresAt,
                ]);

                $started[] = [
                    'meeting_id' => $meeting->id,
                    'name' => $meeting->name,
                    'qr_token' => $token->token,
                    'expires_at' => $token->expires_at->toDateTimeString(),
                ];
                
                \Log::info("Successfully started meeting {$meeting->id}");
            } catch (\Exception $e) {
                \Log::error("Failed to auto-start meeting {$meeting->id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'started_count' => count($started),
            'started_meetings' => $started,
            'current_time_jakarta' => $now->toDateTimeString(),
            'current_time_utc' => $nowUtc->toDateTimeString(),
        ]);
    }

    /**
     * Auto-close meetings when QR token expires (5 minutes after opened)
     */
    public function autoClose(Request $request)
    {
        $now = Carbon::now('Asia/Jakarta');
        
        // Find meetings with expired QR tokens
        $meetingsToClose = Meeting::where('is_open', true)
            ->whereHas('tokens', function($query) use ($now) {
                $query->where('expires_at', '<=', $now);
            })
            ->get();

        $closed = [];

        foreach ($meetingsToClose as $meeting) {
            try {
                // Check if ALL tokens are expired
                $hasActiveToken = $meeting->tokens()
                    ->where('expires_at', '>', $now)
                    ->exists();
                
                // Only close if no active tokens
                if (!$hasActiveToken) {
                    // Update meeting to closed
                    $meeting->update(['is_open' => false]);

                    $closed[] = [
                        'meeting_id' => $meeting->id,
                        'name' => $meeting->name,
                        'closed_at' => $now->toDateTimeString(),
                    ];
                }
            } catch (\Exception $e) {
                \Log::error("Failed to auto-close meeting {$meeting->id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'closed_count' => count($closed),
            'closed_meetings' => $closed,
        ]);
    }
}