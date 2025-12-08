<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class CompleteDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Members (Mahasiswa)
        $members = [
            ['student_id' => '2201010001', 'name' => 'Ahmad Fauzi', 'class_group' => 'TI-A', 'phone' => '081234567801'],
            ['student_id' => '2201010002', 'name' => 'Budi Santoso', 'class_group' => 'TI-A', 'phone' => '081234567802'],
            ['student_id' => '2201010003', 'name' => 'Citra Dewi', 'class_group' => 'TI-A', 'phone' => '081234567803'],
            ['student_id' => '2201010004', 'name' => 'Dian Pratama', 'class_group' => 'TI-A', 'phone' => '081234567804'],
            ['student_id' => '2201010005', 'name' => 'Eko Wijaya', 'class_group' => 'TI-A', 'phone' => '081234567805'],
            ['student_id' => '2201010006', 'name' => 'Fitri Rahmawati', 'class_group' => 'TI-B', 'phone' => '081234567806'],
            ['student_id' => '2201010007', 'name' => 'Gilang Ramadhan', 'class_group' => 'TI-B', 'phone' => '081234567807'],
            ['student_id' => '2201010008', 'name' => 'Hana Safitri', 'class_group' => 'TI-B', 'phone' => '081234567808'],
            ['student_id' => '2201010009', 'name' => 'Indra Kurniawan', 'class_group' => 'TI-B', 'phone' => '081234567809'],
            ['student_id' => '2201010010', 'name' => 'Jasmine Putri', 'class_group' => 'TI-B', 'phone' => '081234567810'],
            ['student_id' => '2201010011', 'name' => 'Kevin Adiputra', 'class_group' => 'TI-C', 'phone' => '081234567811'],
            ['student_id' => '2201010012', 'name' => 'Linda Permata', 'class_group' => 'TI-C', 'phone' => '081234567812'],
            ['student_id' => '2201010013', 'name' => 'Muhammad Rizki', 'class_group' => 'TI-C', 'phone' => '081234567813'],
            ['student_id' => '2201010014', 'name' => 'Nadia Azzahra', 'class_group' => 'TI-C', 'phone' => '081234567814'],
            ['student_id' => '2201010015', 'name' => 'Oscar Firmansyah', 'class_group' => 'TI-C', 'phone' => '081234567815'],
        ];

        foreach ($members as $member) {
            DB::table('members')->insert(array_merge($member, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 2. Create Users (Admin + Praktikan)
        $password = Hash::make('password');
        
        // Admin
        DB::table('users')->insert([
            'name' => 'Dr. Budi Raharjo',
            'email' => 'admin@example.com',
            'password' => $password,
            'role' => 'admin',
            'is_verified' => 1,
            'password_reset_pending' => 0,
            'member_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Praktikan Users (link ke members)
        for ($i = 1; $i <= 15; $i++) {
            $member = DB::table('members')->where('student_id', '220101' . str_pad($i, 4, '0', STR_PAD_LEFT))->first();
            DB::table('users')->insert([
                'name' => $member->name,
                'email' => 'user' . $i . '@example.com',
                'password' => $password,
                'role' => 'praktikan',
                'is_verified' => 1,
                'password_reset_pending' => 0,
                'member_id' => $member->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Create Courses
        $courses = [
            ['code' => 'PRAK001', 'name' => 'Praktikum Basis Data', 'description' => 'Praktikum mata kuliah Basis Data', 'is_active' => 1],
            ['code' => 'PRAK002', 'name' => 'Praktikum Pemrograman Web', 'description' => 'Praktikum mata kuliah Pemrograman Web', 'is_active' => 1],
            ['code' => 'PRAK003', 'name' => 'Praktikum Jaringan Komputer', 'description' => 'Praktikum mata kuliah Jaringan Komputer', 'is_active' => 1],
        ];

        foreach ($courses as $course) {
            DB::table('courses')->insert(array_merge($course, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 4. Create Classes
        $classes = [
            ['code' => 'A1', 'name' => 'Kelas A1', 'capacity' => 40, 'is_active' => 1],
            ['code' => 'A2', 'name' => 'Kelas A2', 'capacity' => 40, 'is_active' => 1],
            ['code' => 'B1', 'name' => 'Kelas B1', 'capacity' => 40, 'is_active' => 1],
            ['code' => 'B2', 'name' => 'Kelas B2', 'capacity' => 40, 'is_active' => 1],
        ];

        foreach ($classes as $class) {
            DB::table('classes')->insert(array_merge($class, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 5. Create Enrollments (Daftarkan mahasiswa ke kelas)
        $courseBasdata = DB::table('courses')->where('code', 'PRAK001')->first();
        $courseWeb = DB::table('courses')->where('code', 'PRAK002')->first();
        $courseJarkom = DB::table('courses')->where('code', 'PRAK003')->first();
        
        $classA1 = DB::table('classes')->where('code', 'A1')->first();
        $classA2 = DB::table('classes')->where('code', 'A2')->first();
        $classB1 = DB::table('classes')->where('code', 'B1')->first();

        // Members 1-5 (TI-A) → Basis Data Kelas A1
        for ($i = 1; $i <= 5; $i++) {
            $member = DB::table('members')->where('student_id', '220101' . str_pad($i, 4, '0', STR_PAD_LEFT))->first();
            DB::table('enrollments')->insert([
                'member_id' => $member->id,
                'course_id' => $courseBasdata->id,
                'class_id' => $classA1->id,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Members 6-10 (TI-B) → Basis Data Kelas A2
        for ($i = 6; $i <= 10; $i++) {
            $member = DB::table('members')->where('student_id', '220101' . str_pad($i, 4, '0', STR_PAD_LEFT))->first();
            DB::table('enrollments')->insert([
                'member_id' => $member->id,
                'course_id' => $courseBasdata->id,
                'class_id' => $classA2->id,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Members 1-5 (TI-A) → Pemrograman Web Kelas B1
        for ($i = 1; $i <= 5; $i++) {
            $member = DB::table('members')->where('student_id', '220101' . str_pad($i, 4, '0', STR_PAD_LEFT))->first();
            DB::table('enrollments')->insert([
                'member_id' => $member->id,
                'course_id' => $courseWeb->id,
                'class_id' => $classB1->id,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Members 11-15 (TI-C) → Jaringan Komputer Kelas A1
        for ($i = 11; $i <= 15; $i++) {
            $member = DB::table('members')->where('student_id', '220101' . str_pad($i, 4, '0', STR_PAD_LEFT))->first();
            DB::table('enrollments')->insert([
                'member_id' => $member->id,
                'course_id' => $courseJarkom->id,
                'class_id' => $classA1->id,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Create Meetings
        $admin = DB::table('users')->where('email', 'admin@example.com')->first();

        // Basis Data - Kelas A1 (3 pertemuan)
        $meetingsBasdataA1 = [
            [
                'name' => 'Pertemuan 1 - Pengenalan SQL',
                'meeting_number' => 1,
                'start_time' => Carbon::parse('2025-11-25 08:00:00'),
                'end_time' => Carbon::parse('2025-11-25 10:00:00'),
            ],
            [
                'name' => 'Pertemuan 2 - DDL dan DML',
                'meeting_number' => 2,
                'start_time' => Carbon::parse('2025-11-27 08:00:00'),
                'end_time' => Carbon::parse('2025-11-27 10:00:00'),
            ],
            [
                'name' => 'Pertemuan 3 - Query Lanjutan',
                'meeting_number' => 3,
                'start_time' => Carbon::parse('2025-11-29 08:00:00'),
                'end_time' => Carbon::parse('2025-11-29 10:00:00'),
            ],
        ];

        foreach ($meetingsBasdataA1 as $meeting) {
            $meetingId = DB::table('meetings')->insertGetId(array_merge($meeting, [
                'course_id' => $courseBasdata->id,
                'class_id' => $classA1->id,
                'user_id' => $admin->id,
                'qr_duration_minutes' => 5,
                'is_open' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            // Generate token untuk meeting
            DB::table('meeting_tokens')->insert([
                'meeting_id' => $meetingId,
                'token' => strtoupper(substr(md5($meetingId . time()), 0, 8)),
                'expires_at' => $meeting['end_time'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Pemrograman Web - Kelas B1 (2 pertemuan)
        $meetingsWebB1 = [
            [
                'name' => 'Pertemuan 1 - HTML & CSS',
                'meeting_number' => 1,
                'start_time' => Carbon::parse('2025-11-26 10:00:00'),
                'end_time' => Carbon::parse('2025-11-26 12:00:00'),
            ],
            [
                'name' => 'Pertemuan 2 - JavaScript',
                'meeting_number' => 2,
                'start_time' => Carbon::parse('2025-11-28 10:00:00'),
                'end_time' => Carbon::parse('2025-11-28 12:00:00'),
            ],
        ];

        foreach ($meetingsWebB1 as $meeting) {
            $meetingId = DB::table('meetings')->insertGetId(array_merge($meeting, [
                'course_id' => $courseWeb->id,
                'class_id' => $classB1->id,
                'user_id' => $admin->id,
                'qr_duration_minutes' => 5,
                'is_open' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            // Generate token untuk meeting
            DB::table('meeting_tokens')->insert([
                'meeting_id' => $meetingId,
                'token' => strtoupper(substr(md5($meetingId . time()), 0, 8)),
                'expires_at' => $meeting['end_time'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 7. Create Attendances (Presensi dummy)
        // Pertemuan 1 Basis Data A1 - 3 mahasiswa hadir
        $meeting1 = DB::table('meetings')
            ->where('course_id', $courseBasdata->id)
            ->where('class_id', $classA1->id)
            ->where('meeting_number', 1)
            ->first();

        for ($i = 1; $i <= 3; $i++) {
            $member = DB::table('members')->where('student_id', '220101' . str_pad($i, 4, '0', STR_PAD_LEFT))->first();
            DB::table('attendances')->insert([
                'meeting_id' => $meeting1->id,
                'member_id' => $member->id,
                'checked_in_at' => Carbon::parse('2025-11-25 08:05:00')->addMinutes($i * 2),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Pertemuan 2 Basis Data A1 - 4 mahasiswa hadir
        $meeting2 = DB::table('meetings')
            ->where('course_id', $courseBasdata->id)
            ->where('class_id', $classA1->id)
            ->where('meeting_number', 2)
            ->first();

        for ($i = 1; $i <= 4; $i++) {
            $member = DB::table('members')->where('student_id', '220101' . str_pad($i, 4, '0', STR_PAD_LEFT))->first();
            DB::table('attendances')->insert([
                'meeting_id' => $meeting2->id,
                'member_id' => $member->id,
                'checked_in_at' => Carbon::parse('2025-11-27 08:10:00')->addMinutes($i * 3),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Pertemuan 1 Web B1 - 2 mahasiswa hadir
        $meetingWeb1 = DB::table('meetings')
            ->where('course_id', $courseWeb->id)
            ->where('class_id', $classB1->id)
            ->where('meeting_number', 1)
            ->first();

        for ($i = 1; $i <= 2; $i++) {
            $member = DB::table('members')->where('student_id', '220101' . str_pad($i, 4, '0', STR_PAD_LEFT))->first();
            DB::table('attendances')->insert([
                'meeting_id' => $meetingWeb1->id,
                'member_id' => $member->id,
                'checked_in_at' => Carbon::parse('2025-11-26 10:05:00')->addMinutes($i * 2),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Complete dummy data created successfully!');
        $this->command->info('📊 Summary:');
        $this->command->info('   - 15 Members (Mahasiswa)');
        $this->command->info('   - 16 Users (1 Admin + 15 Praktikan)');
        $this->command->info('   - 3 Courses');
        $this->command->info('   - 4 Classes');
        $this->command->info('   - 20 Enrollments');
        $this->command->info('   - 5 Meetings');
        $this->command->info('   - 9 Attendances');
        $this->command->info('');
        $this->command->info('🔑 Login credentials (password: "password"):');
        $this->command->info('   Admin: admin@example.com');
        $this->command->info('   Praktikan: user1@example.com - user15@example.com');
    }
}
