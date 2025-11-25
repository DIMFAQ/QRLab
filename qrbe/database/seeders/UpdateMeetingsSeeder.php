<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Meeting;
use App\Models\Course;
use App\Models\ClassModel;

class UpdateMeetingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua meeting yang belum ada course_id
        $meetings = Meeting::whereNull('course_id')->get();
        
        // Ambil data master pertama
        $firstCourse = Course::first();
        $firstClass = ClassModel::first();
        
        if (!$firstCourse || !$firstClass) {
            $this->command->error('Please run MasterDataSeeder first!');
            return;
        }
        
        foreach ($meetings as $meeting) {
            // Parse nama meeting untuk coba match dengan course
            $courseName = $meeting->name;
            
            // Cek apakah ada course yang match dengan nama meeting
            $matchedCourse = Course::where('name', 'like', '%' . substr($courseName, 0, 10) . '%')->first();
            
            if (!$matchedCourse) {
                $matchedCourse = $firstCourse;
            }
            
            $meeting->course_id = $matchedCourse->id;
            $meeting->class_id = $firstClass->id;
            $meeting->save();
            
            $this->command->info("Updated meeting: {$meeting->name} -> {$matchedCourse->name} - {$firstClass->name}");
        }
        
        $this->command->info("Updated {$meetings->count()} meetings with course and class data");
    }
}
