<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Member;
use App\Models\Course;
use App\Models\PraktikumClass;
use App\Models\Enrollment;
use App\Models\Meeting;

class SimpleTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create simple users (praktikan)
        $users = [
            ['name' => 'Andi', 'email' => 'andi@test.com', 'nim' => '111111'],
            ['name' => 'Budi', 'email' => 'budi@test.com', 'nim' => '222222'],
            ['name' => 'Citra', 'email' => 'citra@test.com', 'nim' => '333333'],
            ['name' => 'Deni', 'email' => 'deni@test.com', 'nim' => '444444'],
            ['name' => 'Eka', 'email' => 'eka@test.com', 'nim' => '555555'],
        ];

        foreach ($users as $userData) {
            // Skip if email already exists
            if (User::where('email', $userData['email'])->exists()) {
                continue;
            }

            // Create member
            $member = Member::create([
                'student_id' => $userData['nim'],
                'name' => $userData['name'],
            ]);

            // Create user
            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('123456'),
                'role' => 'praktikan',
                'member_id' => $member->id,
                'email_verified_at' => now(),
            ]);
        }

        // 2. Use existing courses or create if not exist
        $courseData = [
            ['code' => 'IF101', 'name' => 'Algoritma'],
            ['code' => 'IF102', 'name' => 'Database'],
        ];

        $courses = [];
        foreach ($courseData as $data) {
            $courses[] = Course::firstOrCreate(
                ['code' => $data['code']],
                ['name' => $data['name']]
            );
        }

        // 3. Use existing classes or create if not exist
        $classData = [
            ['code' => 'A', 'name' => 'Kelas A'],
            ['code' => 'B', 'name' => 'Kelas B'],
        ];

        $classes = [];
        foreach ($classData as $data) {
            $classes[] = PraktikumClass::firstOrCreate(
                ['code' => $data['code']],
                ['name' => $data['name']]
            );
        }

        // 4. Enroll all students to all courses and classes (aktif)
        $members = Member::whereIn('student_id', ['111111', '222222', '333333', '444444', '555555'])->get();

        foreach ($members as $member) {
            foreach ($courses as $course) {
                foreach ($classes as $class) {
                    // Skip if enrollment already exists
                    if (Enrollment::where('member_id', $member->id)
                        ->where('course_id', $course->id)
                        ->where('class_id', $class->id)
                        ->exists()) {
                        continue;
                    }

                    Enrollment::create([
                        'member_id' => $member->id,
                        'course_id' => $course->id,
                        'class_id' => $class->id,
                        'is_active' => true,
                    ]);
                }
            }
        }

        // 5. Create simple meetings
        $adminUser = User::where('role', 'admin')->first();
        
        if (!$adminUser) {
            $this->command->warn('No admin user found. Skipping meeting creation.');
            return;
        }

        foreach ($courses as $course) {
            foreach ($classes as $class) {
                for ($i = 1; $i <= 3; $i++) {
                    // Skip if meeting already exists
                    if (Meeting::where('course_id', $course->id)
                        ->where('class_id', $class->id)
                        ->where('meeting_number', $i)
                        ->exists()) {
                        continue;
                    }

                    Meeting::create([
                        'name' => "{$course->code} - {$class->name} - P{$i}",
                        'course_id' => $course->id,
                        'class_id' => $class->id,
                        'meeting_number' => $i,
                        'start_time' => now()->addDays($i),
                        'end_time' => now()->addDays($i)->addHours(2),
                        'is_open' => false,
                        'user_id' => $adminUser->id,
                    ]);
                }
            }
        }

        $this->command->info('✅ Simple test data created successfully!');
        $this->command->info('📝 Login credentials:');
        $this->command->info('   Email: andi@test.com | Password: 123456');
        $this->command->info('   Email: budi@test.com | Password: 123456');
        $this->command->info('   Email: citra@test.com | Password: 123456');
        $this->command->info('   Email: deni@test.com | Password: 123456');
        $this->command->info('   Email: eka@test.com | Password: 123456');
    }
}
