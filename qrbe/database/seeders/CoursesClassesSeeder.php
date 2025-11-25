<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\PraktikumClass;
use App\Models\Member;
use App\Models\Enrollment;

class CoursesClassesSeeder extends Seeder
{
    public function run(): void
    {
        // Buat Courses (Praktikum)
        $courses = [
            ['code' => 'IF101', 'name' => 'Pemrograman Web', 'description' => 'Praktikum Pemrograman Web', 'is_active' => true],
            ['code' => 'IF102', 'name' => 'Basis Data', 'description' => 'Praktikum Basis Data', 'is_active' => true],
            ['code' => 'IF103', 'name' => 'Jaringan Komputer', 'description' => 'Praktikum Jaringan Komputer', 'is_active' => true],
        ];

        foreach ($courses as $course) {
            Course::create($course);
        }

        // Buat Classes (Kelas)
        $classes = [
            ['code' => 'A', 'name' => 'Kelas A', 'capacity' => 30, 'is_active' => true],
            ['code' => 'B', 'name' => 'Kelas B', 'capacity' => 30, 'is_active' => true],
            ['code' => 'C', 'name' => 'Kelas C', 'capacity' => 30, 'is_active' => true],
        ];

        foreach ($classes as $class) {
            PraktikumClass::create($class);
        }

        // Ambil data yang baru dibuat
        $courseWeb = Course::where('code', 'IF101')->first();
        $courseDb = Course::where('code', 'IF102')->first();
        $classA = PraktikumClass::where('code', 'A')->first();
        $classB = PraktikumClass::where('code', 'B')->first();

        // Ambil member yang ada (User Praktikan dari seeder sebelumnya)
        $member1 = Member::where('student_id', 'P001')->first();
        
        if ($member1) {
            // Enroll member1 ke Pemrograman Web Kelas A dan Basis Data Kelas B
            Enrollment::create([
                'member_id' => $member1->id,
                'course_id' => $courseWeb->id,
                'class_id' => $classA->id,
                'is_active' => true
            ]);

            Enrollment::create([
                'member_id' => $member1->id,
                'course_id' => $courseDb->id,
                'class_id' => $classB->id,
                'is_active' => true
            ]);
        }

        $this->command->info('✅ Courses, Classes, dan Enrollments berhasil di-seed!');
    }
}
