<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Member;
use App\Models\Course;
use App\Models\PraktikumClass;
use App\Models\Enrollment;
use App\Models\Meeting;
use Illuminate\Support\Facades\Hash;

echo "🔄 Resetting all data...\n\n";

// 1. Clear all data
echo "1️⃣ Clearing existing data...\n";
DB::table('attendances')->delete();
DB::table('meeting_tokens')->delete();
DB::table('qr_sessions')->delete();
DB::table('meetings')->delete();
DB::table('enrollments')->delete();
DB::table('members')->delete();
DB::table('classes')->delete();
DB::table('courses')->delete();
DB::table('users')->where('role', '!=', 'admin')->delete();
echo "   ✅ Data cleared\n\n";

// 2. Create simple courses
echo "2️⃣ Creating courses...\n";
$course1 = Course::create([
    'code' => 'IF101',
    'name' => 'Pemrograman Web',
    'is_active' => true
]);
$course2 = Course::create([
    'code' => 'IF102',
    'name' => 'Basis Data',
    'is_active' => true
]);
echo "   ✅ Created {$course1->code} and {$course2->code}\n\n";

// 3. Create simple classes
echo "3️⃣ Creating classes...\n";
$class1 = PraktikumClass::create([
    'code' => 'A',
    'name' => 'Kelas A',
    'capacity' => 30,
    'is_active' => true
]);
$class2 = PraktikumClass::create([
    'code' => 'B',
    'name' => 'Kelas B',
    'capacity' => 30,
    'is_active' => true
]);
echo "   ✅ Created Kelas A and Kelas B\n\n";

// 4. Create simple members & users
echo "4️⃣ Creating praktikan...\n";
$member1 = Member::create([
    'student_id' => '12345',
    'name' => 'Ahmad',
    'email' => 'ahmad@test.com',
    'is_active' => true
]);
$user1 = User::create([
    'name' => 'Ahmad',
    'email' => 'ahmad@test.com',
    'password' => Hash::make('password'),
    'role' => 'praktikan',
    'member_id' => $member1->id,
    'email_verified_at' => now()
]);

$member2 = Member::create([
    'student_id' => '12346',
    'name' => 'Budi',
    'email' => 'budi@test.com',
    'is_active' => true
]);
$user2 = User::create([
    'name' => 'Budi',
    'email' => 'budi@test.com',
    'password' => Hash::make('password'),
    'role' => 'praktikan',
    'member_id' => $member2->id,
    'email_verified_at' => now()
]);

$member3 = Member::create([
    'student_id' => '12347',
    'name' => 'Citra',
    'email' => 'citra@test.com',
    'is_active' => true
]);
$user3 = User::create([
    'name' => 'Citra',
    'email' => 'citra@test.com',
    'password' => Hash::make('password'),
    'role' => 'praktikan',
    'member_id' => $member3->id,
    'email_verified_at' => now()
]);

$member4 = Member::create([
    'student_id' => '12348',
    'name' => 'Dewi',
    'email' => 'dewi@test.com',
    'is_active' => true
]);
$user4 = User::create([
    'name' => 'Dewi',
    'email' => 'dewi@test.com',
    'password' => Hash::make('password'),
    'role' => 'praktikan',
    'member_id' => $member4->id,
    'email_verified_at' => now()
]);

echo "   ✅ Created 4 praktikan (Ahmad, Budi, Citra, Dewi) - password: password\n\n";

// 5. Create enrollments
echo "5️⃣ Creating enrollments...\n";
// Ahmad: IF101 Kelas A, IF102 Kelas A
Enrollment::create([
    'member_id' => $member1->id,
    'course_id' => $course1->id,
    'class_id' => $class1->id,
    'is_active' => true
]);
Enrollment::create([
    'member_id' => $member1->id,
    'course_id' => $course2->id,
    'class_id' => $class1->id,
    'is_active' => true
]);

// Budi: IF101 Kelas B, IF102 Kelas B
Enrollment::create([
    'member_id' => $member2->id,
    'course_id' => $course1->id,
    'class_id' => $class2->id,
    'is_active' => true
]);
Enrollment::create([
    'member_id' => $member2->id,
    'course_id' => $course2->id,
    'class_id' => $class2->id,
    'is_active' => true
]);

// Citra: IF102 Kelas A (sama dengan Ahmad)
Enrollment::create([
    'member_id' => $member3->id,
    'course_id' => $course2->id,
    'class_id' => $class1->id,
    'is_active' => true
]);

// Dewi: IF102 Kelas A (sama dengan Ahmad)
Enrollment::create([
    'member_id' => $member4->id,
    'course_id' => $course2->id,
    'class_id' => $class1->id,
    'is_active' => true
]);

echo "   ✅ Ahmad enrolled in IF101-A and IF102-A\n";
echo "   ✅ Budi enrolled in IF101-B and IF102-B\n";
echo "   ✅ Citra enrolled in IF102-A\n";
echo "   ✅ Dewi enrolled in IF102-A\n\n";

// 6. Create meetings
echo "6️⃣ Creating meetings...\n";
$now = now('Asia/Jakarta');

// Meeting 1: IF101 Kelas A - Sudah lewat (untuk riwayat)
$meeting1 = Meeting::create([
    'name' => 'IF101 - Kelas A - Pertemuan 1',
    'meeting_number' => 1,
    'course_id' => $course1->id,
    'class_id' => $class1->id,
    'start_time' => $now->copy()->subHours(2)->setTimezone('UTC'),
    'end_time' => $now->copy()->subHours(1)->setTimezone('UTC'),
    'qr_duration_minutes' => 5,
    'is_open' => false,
    'user_id' => 1
]);
echo "   📅 Meeting 1: {$meeting1->name} (PAST)\n";

// Meeting 2: IF101 Kelas A - Akan datang (besok)
$meeting2 = Meeting::create([
    'name' => 'IF101 - Kelas A - Pertemuan 2',
    'meeting_number' => 2,
    'course_id' => $course1->id,
    'class_id' => $class1->id,
    'start_time' => $now->copy()->addDay()->setHour(9)->setMinute(0)->setTimezone('UTC'),
    'end_time' => $now->copy()->addDay()->setHour(11)->setMinute(0)->setTimezone('UTC'),
    'qr_duration_minutes' => 5,
    'is_open' => false,
    'user_id' => 1
]);
echo "   📅 Meeting 2: {$meeting2->name} (TOMORROW)\n";

// Meeting 3: IF102 Kelas A - Sedang berjalan (bisa scan sekarang)
$meeting3 = Meeting::create([
    'name' => 'IF102 - Kelas A - Pertemuan 1',
    'meeting_number' => 1,
    'course_id' => $course2->id,
    'class_id' => $class1->id,
    'start_time' => $now->copy()->subMinutes(10)->setTimezone('UTC'),
    'end_time' => $now->copy()->addHour()->setTimezone('UTC'),
    'qr_duration_minutes' => 5,
    'is_open' => false,
    'user_id' => 1
]);
echo "   📅 Meeting 3: {$meeting3->name} (NOW - ready to start)\n";

// Meeting 4: IF101 Kelas B - Akan datang (untuk Budi)
$meeting4 = Meeting::create([
    'name' => 'IF101 - Kelas B - Pertemuan 1',
    'meeting_number' => 1,
    'course_id' => $course1->id,
    'class_id' => $class2->id,
    'start_time' => $now->copy()->addDay()->setHour(13)->setMinute(0)->setTimezone('UTC'),
    'end_time' => $now->copy()->addDay()->setHour(15)->setMinute(0)->setTimezone('UTC'),
    'qr_duration_minutes' => 5,
    'is_open' => false,
    'user_id' => 1
]);
echo "   📅 Meeting 4: {$meeting4->name} (TOMORROW - for Budi)\n\n";

// 7. Create sample attendance data untuk Meeting 3 (IF102-A Pertemuan 1)
echo "7️⃣ Creating sample attendance data...\n";

use App\Models\Attendance;

// Meeting 3 mulai 10 menit yang lalu
$meetingStartTime = $now->copy()->subMinutes(10);

// Ahmad - HADIR (scan tepat waktu, 2 menit setelah meeting mulai)
$ahmadScanTime = $meetingStartTime->copy()->addMinutes(2)->setTimezone('UTC');
Attendance::create([
    'meeting_id' => $meeting3->id,
    'member_id' => $member1->id,
    'checked_in_at' => $ahmadScanTime,
    'created_at' => $ahmadScanTime,
    'updated_at' => $ahmadScanTime,
]);
echo "   ✅ Ahmad - HADIR (scan 2 menit setelah mulai)\n";

// Citra - TERLAMBAT (scan 20 menit setelah meeting mulai)
$citraScanTime = $meetingStartTime->copy()->addMinutes(20)->setTimezone('UTC');
Attendance::create([
    'meeting_id' => $meeting3->id,
    'member_id' => $member3->id,
    'checked_in_at' => $citraScanTime,
    'created_at' => $citraScanTime,
    'updated_at' => $citraScanTime,
]);
echo "   ✅ Citra - TERLAMBAT (scan 20 menit setelah mulai)\n";

// Dewi - ALPA (tidak scan)
echo "   ⚠️  Dewi - ALPA (tidak scan)\n\n";

echo "✅ Reset complete!\n\n";
echo "📊 Summary:\n";
echo "   Courses: 2 (IF101, IF102)\n";
echo "   Classes: 2 (A, B)\n";
echo "   Praktikan: 4 (Ahmad, Budi, Citra, Dewi)\n";
echo "   Meetings: 4\n";
echo "   Attendance: 2 records\n\n";

echo "🔑 Login credentials:\n";
echo "   Email: ahmad@test.com\n";
echo "   Password: password\n\n";
echo "   Email: budi@test.com\n";
echo "   Password: password\n\n";

echo "📝 Test scenario:\n";
echo "   1. Login sebagai admin\n";
echo "   2. Buka meeting IF102-A Pertemuan 1\n";
echo "   3. Lihat rekap presensi:\n";
echo "      - Ahmad: HADIR ✅\n";
echo "      - Citra: TERLAMBAT ⚠️\n";
echo "      - Dewi: ALPA ❌\n\n";
echo "   4. Admin bisa start meeting IF102 untuk testing scan QR\n\n";
