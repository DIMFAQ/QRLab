<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Member;
use App\Models\Attendance;
use App\Models\Meeting;
use App\Models\Enrollment;

class PraktikanController extends Controller
{
    // Ambil profil user praktikan
    public function me(Request $request)
    {
        $user = $request->user();
        
        $member = null;
        if ($user->member_id) {
            $member = Member::find($user->member_id);
        }

        return response()->json([
            'name' => $user->name,
            'student_id' => $member->student_id ?? '',
            'class_group' => $member->class_group ?? '',
            'phone' => $member->phone ?? '',
        ]);
    }

    // Update profil praktikan
    public function update(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'student_id' => 'required|string|max:50',
            'class_group' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update(['name' => $data['name']]);

        Member::updateOrCreate(
            ['user_id' => $user->id],
            [
                'student_id' => $data['student_id'],
                'class_group' => $data['class_group'] ?? null,
                'phone' => $data['phone'] ?? null,
            ]
        );

        return response()->json(['message' => 'Profil berhasil diperbarui.']);
    }

    // Ambil riwayat presensi
    public function riwayat(Request $request)
    {
        $user = $request->user();
        
        if (!$user->member_id) {
            return response()->json([]);
        }
        
        $member = Member::find($user->member_id);

        if (!$member) {
            return response()->json([]);
        }

        $items = Attendance::where('member_id', $member->id)
            ->with('meeting:id,name,meeting_number')
            ->latest()
            ->take(30)
            ->get()
            ->map(fn($a) => [
                'meeting_name' => $a->meeting->name ?? null,
                'meeting_number' => $a->meeting->meeting_number ?? null,
                'checked_at' => $a->created_at,
                'status' => 'Hadir',
            ]);

        return response()->json($items);
    }

    // Fungsi untuk getAttendanceHistory dengan summary
    public function getAttendanceHistory(Request $request)
    {
        $user = $request->user();
        
        if (!$user->member_id) {
            return response()->json([
                'summary' => ['hadir' => 0, 'terlambat' => 0, 'alpa' => 0],
                'history' => []
            ]);
        }

        $member = Member::find($user->member_id);

        if (!$member) {
            return response()->json([
                'summary' => ['hadir' => 0, 'terlambat' => 0, 'alpa' => 0],
                'history' => []
            ]);
        }

        // Ambil enrollment mahasiswa untuk filter meeting
        $enrollments = Enrollment::where('member_id', $member->id)
            ->where('is_active', true)
            ->get();

        if ($enrollments->isEmpty()) {
            return response()->json([
                'summary' => ['hadir' => 0, 'terlambat' => 0, 'alpa' => 0],
                'history' => []
            ]);
        }

        // Ambil semua meeting_id yang sesuai dengan enrollment
        $validMeetingIds = [];
        foreach ($enrollments as $enrollment) {
            $meetingIds = Meeting::where('course_id', $enrollment->course_id)
                ->where('class_id', $enrollment->class_id)
                ->pluck('id')
                ->toArray();
            $validMeetingIds = array_merge($validMeetingIds, $meetingIds);
        }

        // Jika tidak ada meeting yang valid, tetap return empty tapi dengan info
        if (empty($validMeetingIds)) {
            return response()->json([
                'summary' => ['hadir' => 0, 'terlambat' => 0, 'alpa' => 0],
                'history' => []
            ]);
        }

        // Ambil attendance mahasiswa dulu
        $attendances = Attendance::where('member_id', $member->id)
            ->whereIn('meeting_id', $validMeetingIds)
            ->get()
            ->keyBy('meeting_id');

        // Ambil semua meeting yang sudah lewat ATAU sudah di-presensi
        $allMeetings = Meeting::whereIn('id', $validMeetingIds)
            ->with(['course:id,code,name', 'praktikumClass:id,code,name'])
            ->orderBy('start_time', 'desc')
            ->get();

        // Filter: tampilkan jika end_time sudah lewat ATAU sudah ada attendance
        $pastMeetings = $allMeetings->filter(function($meeting) use ($attendances) {
            $hasAttendance = $attendances->has($meeting->id);
            $isPast = $meeting->end_time < now();
            
            // Tampilkan di riwayat jika: sudah presensi ATAU meeting sudah selesai
            return $hasAttendance || $isPast;
        });

        $summary = [
            'hadir' => 0,
            'terlambat' => 0,
            'alpa' => 0,
        ];

        $history = $pastMeetings->map(function($meeting) use ($attendances, &$summary, $member) {
            $attendance = $attendances->get($meeting->id);
            
            // Tentukan status berdasarkan ada/tidaknya attendance dan waktu check-in
            $status = 'Alpa';
            $scannedAt = null;
            
            if ($attendance) {
                // Hitung status berdasarkan waktu scan (checked_in_at)
                $startTime = \Carbon\Carbon::parse($meeting->start_time);
                $scanTime = \Carbon\Carbon::parse($attendance->checked_in_at);
                
                // diffInMinutes dengan false: positif jika scan setelah start, negatif jika sebelum
                $minutesAfterStart = $startTime->diffInMinutes($scanTime, false);
                
                // Status:
                // - Scan sebelum start (negatif) atau 0-15 menit setelah = Hadir
                // - Scan > 15 menit setelah start = Terlambat
                if ($minutesAfterStart <= 0) {
                    $status = 'Hadir'; // Scan sebelum/tepat waktu meeting dimulai
                    $summary['hadir']++;
                } elseif ($minutesAfterStart <= 15) {
                    $status = 'Hadir'; // Toleransi 15 menit setelah start
                    $summary['hadir']++;
                } else {
                    $status = 'Terlambat'; // Lebih dari 15 menit
                    $summary['terlambat']++;
                }
                
                $scannedAt = $scanTime->timezone('Asia/Jakarta')->format('Y-m-d H:i:s');
            } else {
                $summary['alpa']++;
            }
            
            return [
                'id' => $meeting->id,
                'meeting_name' => $meeting->name,
                'meeting_number' => $meeting->meeting_number,
                'course_name' => $meeting->course->name ?? null,
                'course_code' => $meeting->course->code ?? null,
                'class_name' => $meeting->praktikumClass->name ?? null,
                'scanned_at' => $scannedAt,
                'status' => $status,
            ];
        });

        return response()->json([
            'summary' => $summary,
            'history' => $history->values()->toArray() // Convert to array with sequential keys
        ]);
    }

    public function getActiveMeetings(Request $request)
    {
        $meetings = \App\Models\Meeting::where('is_open', true)->get();
        return response()->json($meetings);
    }

    // GET /api/praktikan/jadwal - Lihat jadwal pertemuan sesuai enrollment
    public function getSchedule(Request $request)
    {
        $user = $request->user();
        
        \Log::info('getSchedule called', ['user_id' => $user->id, 'member_id' => $user->member_id]);
        
        // Cari member berdasarkan member_id di user
        if (!$user->member_id) {
            \Log::warning('No member_id for user', ['user_id' => $user->id]);
            return response()->json([
                'message' => 'Data mahasiswa tidak ditemukan',
                'enrollments' => [],
                'schedules' => []
            ]);
        }

        $member = Member::find($user->member_id);
        
        if (!$member) {
            \Log::warning('Member not found', ['member_id' => $user->member_id]);
            return response()->json([
                'message' => 'Data mahasiswa tidak ditemukan',
                'enrollments' => [],
                'schedules' => []
            ]);
        }

        // Ambil semua enrollment mahasiswa
        $enrollments = Enrollment::where('member_id', $member->id)
            ->where('is_active', true)
            ->with(['course', 'praktikumClass'])
            ->get();

        \Log::info('Enrollments found', ['count' => $enrollments->count()]);

        if ($enrollments->isEmpty()) {
            \Log::warning('No enrollments for member', ['member_id' => $member->id]);
            return response()->json([
                'message' => 'Anda belum terdaftar di praktikum manapun',
                'enrollments' => [],
                'schedules' => []
            ]);
        }

        // Ambil semua meeting yang sesuai dengan enrollment mahasiswa
        $schedules = [];
        
        \Log::info('Before foreach', [
            'enrollments_count' => $enrollments->count(),
            'enrollments_isEmpty' => $enrollments->isEmpty(),
            'enrollments_class' => get_class($enrollments)
        ]);
        
        foreach ($enrollments as $enrollment) {
            \Log::info('Processing enrollment', [
                'course_id' => $enrollment->course_id,
                'class_id' => $enrollment->class_id
            ]);
            
            $meetings = Meeting::where('course_id', $enrollment->course_id)
                ->where('class_id', $enrollment->class_id)
                ->with(['course', 'praktikumClass'])
                ->orderBy('start_time', 'asc')
                ->get();

            \Log::info('Meetings found for enrollment', [
                'course_id' => $enrollment->course_id,
                'class_id' => $enrollment->class_id,
                'meetings_count' => $meetings->count()
            ]);

            foreach ($meetings as $meeting) {
                // Cek apakah mahasiswa sudah absen
                $attendance = Attendance::where('member_id', $member->id)
                    ->where('meeting_id', $meeting->id)
                    ->first();

                // FILTER: Hanya tampilkan di jadwal jika belum presensi
                // Jika sudah presensi, akan masuk ke riwayat otomatis
                if ($attendance) {
                    \Log::info('Skipping meeting - already attended', [
                        'meeting_id' => $meeting->id,
                        'attendance_id' => $attendance->id
                    ]);
                    continue;
                }

                // Hitung status attendance
                $attendanceStatus = null;
                if ($attendance) {
                    $checkedAt = $attendance->created_at;
                    $meetingStart = $meeting->start_time;
                    $lateThreshold = $meetingStart->copy()->addMinutes(15);
                    
                    if ($checkedAt <= $lateThreshold) {
                        $attendanceStatus = 'Hadir';
                    } else {
                        $attendanceStatus = 'Terlambat';
                    }
                }

                \Log::info('Meeting details', [
                    'meeting_id' => $meeting->id,
                    'name' => $meeting->name,
                    'start_time' => $meeting->start_time,
                    'end_time' => $meeting->end_time,
                    'is_open' => $meeting->is_open,
                    'has_attendance' => !!$attendance,
                    'attendance_status' => $attendanceStatus
                ]);

                $schedules[] = [
                    'id' => $meeting->id,
                    'course_name' => $meeting->course->name,
                    'course_code' => $meeting->course->code,
                    'class_name' => $meeting->praktikumClass->name,
                    'class_code' => $meeting->praktikumClass->code,
                    'meeting_number' => $meeting->meeting_number,
                    'name' => $meeting->name,
                    'start_time' => $meeting->start_time,
                    'end_time' => $meeting->end_time,
                    'is_open' => $meeting->is_open,
                    'has_attended' => false, // Di jadwal berarti belum presensi
                    'attendance_status' => null,
                    'attendance_time' => null,
                ];
            }
        }

        \Log::info('Total schedules before sort', ['count' => count($schedules)]);

        // Sort by start_time
        usort($schedules, function($a, $b) {
            return strtotime($a['start_time']) - strtotime($b['start_time']);
        });

        return response()->json([
            'enrollments' => $enrollments->map(function($e) {
                return [
                    'course' => $e->course->code . ' - ' . $e->course->name,
                    'class' => $e->praktikumClass->name,
                ];
            }),
            'schedules' => $schedules
        ]);
    }
}
