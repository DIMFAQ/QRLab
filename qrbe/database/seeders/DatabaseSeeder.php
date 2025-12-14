<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Member;
use App\Models\Course;
use App\Models\PraktikumClass;
use App\Models\Enrollment;
use App\Models\Meeting;
use App\Models\Attendance;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admins
        $admins = [];
        for ($a = 1; $a <= 3; $a++) {
            $admins[] = User::firstOrCreate(
                ['email' => "admin$a@example.com"],
                [
                    'name' => "Admin $a",
                    'password' => Hash::make('admin123'),
                    'role' => 'admin',
                    'is_verified' => true,
                    'member_id' => null,
                    'email_verified_at' => now(),
                    'password_reset_pending' => false,
                    'temp_password' => null,
                    'profile_photo' => null,
                ]
            );
        }

        // 2. Courses
        $courses = [];
        $courseData = [
            ['code' => 'IF101', 'name' => 'Pemrograman Web'],
            ['code' => 'IF102', 'name' => 'Basis Data'],
            ['code' => 'IF103', 'name' => 'Jaringan Komputer'],
            ['code' => 'IF104', 'name' => 'Algoritma'],
        ];
        foreach ($courseData as $c) {
            $courses[] = Course::firstOrCreate(
                ['code' => $c['code']],
                [
                    'name' => $c['name'],
                    'description' => 'Praktikum ' . $c['name'],
                    'is_active' => true,
                ]
            );
        }

        // 3. Classes
        $classes = [];
        $classData = [
            ['code' => 'A', 'name' => 'Kelas A'],
            ['code' => 'B', 'name' => 'Kelas B'],
            ['code' => 'C', 'name' => 'Kelas C'],
            ['code' => 'D', 'name' => 'Kelas D'],
        ];
        foreach ($classData as $cl) {
            $classes[] = PraktikumClass::firstOrCreate(
                ['code' => $cl['code']],
                [
                    'name' => $cl['name'],
                    'capacity' => 40,
                    'is_active' => true,
                ]
            );
        }

        // 4. Members & Praktikan Users (50 orang)
        $members = [];
        for ($i = 1; $i <= 50; $i++) {
            $member = Member::firstOrCreate(
                ['student_id' => '22' . str_pad($i, 6, '0', STR_PAD_LEFT)],
                [
                    'name' => 'Mahasiswa ' . $i,
                    'class_group' => $classes[array_rand($classes)]->code,
                    'phone' => '08123' . str_pad($i, 7, '0', STR_PAD_LEFT),
                ]
            );
            $members[] = $member;

            User::firstOrCreate(
                ['email' => 'user' . $i . '@example.com'],
                [
                    'name' => $member->name,
                    'password' => Hash::make('password'),
                    'role' => 'praktikan',
                    'is_verified' => true,
                    'member_id' => $member->id,
                    'email_verified_at' => now(),
                    'password_reset_pending' => false,
                    'temp_password' => null,
                    'profile_photo' => null,
                ]
            );
        }

        // 5. Enrollments (acak, setiap member bisa ikut 1-3 course/class)
        foreach ($members as $member) {
            $enrolled = [];
            for ($j = 0; $j < rand(1, 3); $j++) {
                $course = $courses[array_rand($courses)];
                $class = $classes[array_rand($classes)];
                $key = $course->id . '-' . $class->id;
                if (!in_array($key, $enrolled)) {
                    Enrollment::firstOrCreate([
                        'member_id' => $member->id,
                        'course_id' => $course->id,
                        'class_id' => $class->id,
                    ], [
                        'is_active' => true,
                    ]);
                    $enrolled[] = $key;
                }
            }
        }

        // 6. Meetings (setiap course/class ada 3 meeting)
        $meetings = [];
        foreach ($courses as $course) {
            foreach ($classes as $class) {
                for ($m = 1; $m <= 3; $m++) {
                    $start = Carbon::now()->subDays(rand(1, 30))->setTime(rand(7, 10), 0, 0);
                    $end = (clone $start)->addHours(2);
                    $meeting = Meeting::firstOrCreate(
                        [
                            'name' => "{$course->name} - {$class->name} - Pertemuan $m",
                            'meeting_number' => $m,
                            'course_id' => $course->id,
                            'class_id' => $class->id,
                        ],
                        [
                            'start_time' => $start,
                            'end_time' => $end,
                            'qr_duration_minutes' => rand(5, 15),
                            'is_open' => false,
                            'user_id' => $admins[array_rand($admins)]->id,
                        ]
                    );
                    $meetings[] = $meeting;
                }
            }
        }

        // 7. Attendances (acak, 60-90% enrolled hadir tiap meeting)
        foreach ($meetings as $meeting) {
            $enrolledMembers = Enrollment::where('course_id', $meeting->course_id)
                ->where('class_id', $meeting->class_id)
                ->pluck('member_id')
                ->toArray();

            shuffle($enrolledMembers);
            $hadirCount = (int)ceil(count($enrolledMembers) * rand(60, 90) / 100);

            foreach (array_slice($enrolledMembers, 0, $hadirCount) as $memberId) {
                Attendance::firstOrCreate([
                    'member_id' => $memberId,
                    'meeting_id' => $meeting->id,
                ], [
                    'checked_in_at' => $meeting->start_time->copy()->addMinutes(rand(0, 30)),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('✅ Seeder selesai! Admin: admin1@example.com - admin3@example.com (admin123), Praktikan: user1@example.com - user50@example.com (password)');
    }
}