<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Meeting;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    public function run()
    {
        $members = Member::all();
        $meeting = Meeting::first();

        if (!$meeting || $members->isEmpty()) {
            $this->command->info('No members or meetings found. Please create them first.');
            return;
        }

        // Create attendance for last 7 days
        for ($day = 6; $day >= 0; $day--) {
            $date = Carbon::today()->subDays($day);
            $attendanceCount = rand(2, min(5, $members->count()));

            $randomMembers = $members->random($attendanceCount);

            foreach ($randomMembers as $member) {
                Attendance::create([
                    'member_id' => $member->id,
                    'meeting_id' => $meeting->id,
                    'checked_in_at' => $date->copy()->addHours(rand(8, 16))->addMinutes(rand(0, 59)),
                    'created_at' => $date->copy()->addHours(rand(8, 16))->addMinutes(rand(0, 59)),
                    'updated_at' => $date->copy()->addHours(rand(8, 16))->addMinutes(rand(0, 59)),
                ]);
            }

            $this->command->info("Created {$attendanceCount} attendances for {$date->toDateString()}");
        }

        $this->command->info('Attendance seeding completed!');
    }
}
