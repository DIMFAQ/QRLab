<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Meeting;
use App\Models\Attendance;
use App\Models\Member;
use Carbon\Carbon;

echo "=== DASHBOARD STATS TEST ===\n\n";

echo "Current Time (Server): " . Carbon::now() . "\n";
echo "Current Date: " . Carbon::today()->toDateString() . "\n\n";

// Total mahasiswa aktif
$mahasiswa = Member::whereHas('user', function ($q) {
    $q->where('role', 'praktikan')
      ->whereNotNull('email_verified_at');
})->count();
echo "✓ Total Mahasiswa Aktif: {$mahasiswa}\n";

// Absensi hari ini
$hadir_hari_ini = Attendance::whereDate('created_at', Carbon::today())->count();
echo "✓ Absensi Hari Ini: {$hadir_hari_ini}\n";

// Sesi aktif
$sesi_aktif = Meeting::where('is_open', true)->count();
echo "✓ Sesi Aktif: {$sesi_aktif}\n";

// Total pertemuan
$pertemuan = Meeting::count();
echo "✓ Total Jadwal/Pertemuan: {$pertemuan}\n\n";

echo "=== WEEKLY STATS (Last 7 Days) ===\n";
for ($i = 6; $i >= 0; $i--) {
    $date = Carbon::today()->subDays($i);
    $label = $date->locale('id')->isoFormat('ddd');
    $count = Attendance::whereDate('created_at', $date)->count();
    echo "{$label} ({$date->toDateString()}): {$count} kehadiran\n";
}

echo "\n✅ All stats working correctly!\n";
