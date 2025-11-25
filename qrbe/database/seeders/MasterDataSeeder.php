<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\ClassModel;

class MasterDataSeeder extends Seeder
{
    public function run()
    {
        // Master Courses (Praktikum)
        $courses = [
            ['code' => 'IF101', 'name' => 'Algoritma & Struktur Data', 'description' => 'Praktikum Algoritma dan Struktur Data'],
            ['code' => 'IF102', 'name' => 'Jaringan Komputer', 'description' => 'Praktikum Jaringan Komputer'],
            ['code' => 'IF103', 'name' => 'Basis Data', 'description' => 'Praktikum Basis Data'],
            ['code' => 'IF104', 'name' => 'Pemrograman Web', 'description' => 'Praktikum Pemrograman Web'],
            ['code' => 'IF105', 'name' => 'Sistem Operasi', 'description' => 'Praktikum Sistem Operasi'],
        ];

        foreach ($courses as $course) {
            Course::create($course);
            $this->command->info("Created course: {$course['name']}");
        }

        // Master Classes (Kelas)
        $classes = [
            ['code' => 'A', 'name' => 'Kelas A', 'capacity' => 40],
            ['code' => 'B', 'name' => 'Kelas B', 'capacity' => 40],
            ['code' => 'C', 'name' => 'Kelas C', 'capacity' => 35],
            ['code' => 'D', 'name' => 'Kelas D', 'capacity' => 35],
        ];

        foreach ($classes as $class) {
            ClassModel::create($class);
            $this->command->info("Created class: {$class['name']}");
        }

        $this->command->info("\n✅ Master data seeding completed!");
        $this->command->info("  - Courses: " . Course::count());
        $this->command->info("  - Classes: " . ClassModel::count());
    }
}
