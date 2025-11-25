<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Meeting;
use App\Models\Attendance;
use App\Models\Member;
use Carbon\Carbon;

echo "=== SISTEM PRESENSI QR - DATA SUMMARY ===\n\n";
echo "Current Time: " . Carbon::now()->format('Y-m-d H:i:s') . " WIB\n\n";

// 1. Total Mahasiswa
$totalMembers = Member::whereHas('user', function ($q) {
    $q->where('role', 'praktikan')->whereNotNull('email_verified_at');
})->count();
echo "📊 TOTAL MAHASISWA AKTIF: {$totalMembers}\n\n";

// 2. Meetings
$meetings = Meeting::orderBy('start_time', 'desc')->get();
echo "📅 DAFTAR PERTEMUAN ({$meetings->count()}):\n";
echo str_repeat("=", 80) . "\n";

foreach ($meetings as $meeting) {
    $status = $meeting->is_open ? "🟢 AKTIF" : "⚫ TUTUP";
    $attendanceCount = Attendance::where('meeting_id', $meeting->id)->count();
    
    echo "{$status} | {$meeting->name} - Pertemuan {$meeting->meeting_number}\n";
    echo "       Start: {$meeting->start_time->format('Y-m-d H:i')} WIB\n";
    echo "       End: {$meeting->end_time->format('Y-m-d H:i')} WIB\n";
    echo "       Kehadiran: {$attendanceCount}/{$totalMembers} mahasiswa\n";
    
    if ($attendanceCount > 0) {
        // Hitung statistik
        $onTime = 0;
        $late = 0;
        
        $attendances = Attendance::where('meeting_id', $meeting->id)->get();
        foreach ($attendances as $att) {
            $diff = Carbon::parse($att->checked_in_at)->diffInMinutes($meeting->start_time);
            if ($diff <= 15) {
                $onTime++;
            } else {
                $late++;
            }
        }
        
        $absent = $totalMembers - $attendanceCount;
        
        echo "       └─ Tepat Waktu: {$onTime} | Terlambat: {$late} | Alpa: {$absent}\n";
    }
    echo "\n";
}

// 3. Active Sessions
$activeSessions = Meeting::where('is_open', true)->count();
echo "🔴 SESI AKTIF SAAT INI: {$activeSessions}\n\n";

// 4. Today's Attendance
$todayAttendance = Attendance::whereDate('created_at', Carbon::today())->count();
echo "✅ ABSENSI HARI INI: {$todayAttendance}\n\n";

// 5. List members
echo "👥 DAFTAR MAHASISWA:\n";
echo str_repeat("=", 80) . "\n";
$members = Member::with('user')->whereHas('user', function ($q) {
    $q->where('role', 'praktikan')->whereNotNull('email_verified_at');
})->get();

foreach ($members as $member) {
    $totalAttendance = Attendance::where('member_id', $member->id)->count();
    echo sprintf("%-15s | %-30s | Hadir: %2d kali\n", 
        $member->student_id, 
        $member->name,
        $totalAttendance
    );
}

echo "\n" . str_repeat("=", 80) . "\n";
echo "✅ Semua data berhasil dimuat!\n";
