<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Meeting;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\User;
use Carbon\Carbon;

class MeetingWithAttendanceSeeder extends Seeder
{
    public function run()
    {
        $admin = User::where('role', 'admin')->first();
        
        if (!$admin) {
            $this->command->error('No admin user found. Please create admin first.');
            return;
        }

        // Create 3 meetings dengan berbagai status
        $meetings = [
            [
                'name' => 'Jaringan Komputer',
                'meeting_number' => 1,
                'start_time' => Carbon::today()->setTime(8, 0, 0),
                'end_time' => Carbon::today()->setTime(10, 0, 0),
                'qr_duration_minutes' => 5,
                'is_open' => true, // Sesi aktif
            ],
            [
                'name' => 'Algoritma & Struktur Data',
                'meeting_number' => 2,
                'start_time' => Carbon::today()->setTime(13, 0, 0),
                'end_time' => Carbon::today()->setTime(15, 0, 0),
                'qr_duration_minutes' => 10,
                'is_open' => false, // Sesi sudah ditutup
            ],
            [
                'name' => 'Basis Data',
                'meeting_number' => 1,
                'start_time' => Carbon::tomorrow()->setTime(9, 0, 0),
                'end_time' => Carbon::tomorrow()->setTime(11, 0, 0),
                'qr_duration_minutes' => 5,
                'is_open' => false, // Sesi belum dimulai
            ],
        ];

        $members = Member::whereHas('user', function ($q) {
            $q->where('role', 'praktikan')->whereNotNull('email_verified_at');
        })->get();

        if ($members->isEmpty()) {
            $this->command->error('No members found. Please create members first.');
            return;
        }

        foreach ($meetings as $meetingData) {
            $meeting = Meeting::create([
                'name' => $meetingData['name'],
                'meeting_number' => $meetingData['meeting_number'],
                'start_time' => $meetingData['start_time'],
                'end_time' => $meetingData['end_time'],
                'qr_duration_minutes' => $meetingData['qr_duration_minutes'],
                'is_open' => $meetingData['is_open'],
                'user_id' => $admin->id,
            ]);

            $this->command->info("Created meeting: {$meeting->name} - Pertemuan {$meeting->meeting_number}");

            // Buat attendance untuk meeting yang sudah/sedang berlangsung
            if ($meeting->start_time <= Carbon::now()) {
                // Simulasi berbagai status kehadiran
                $totalMembers = $members->count();
                
                // 60% hadir tepat waktu
                $onTimeCount = (int)ceil($totalMembers * 0.6);
                $onTimeMembers = $members->random(min($onTimeCount, $totalMembers));
                
                foreach ($onTimeMembers as $member) {
                    $checkInTime = $meeting->start_time->copy()->addMinutes(rand(0, 10));
                    
                    Attendance::create([
                        'member_id' => $member->id,
                        'meeting_id' => $meeting->id,
                        'checked_in_at' => $checkInTime,
                        'created_at' => $checkInTime,
                        'updated_at' => $checkInTime,
                    ]);
                }
                
                // 20% terlambat (lebih dari 15 menit)
                $lateCount = (int)ceil($totalMembers * 0.2);
                $remainingMembers = $members->diff($onTimeMembers);
                
                if ($remainingMembers->count() > 0) {
                    $lateMembers = $remainingMembers->random(min($lateCount, $remainingMembers->count()));
                    
                    foreach ($lateMembers as $member) {
                        $checkInTime = $meeting->start_time->copy()->addMinutes(rand(16, 40));
                        
                        Attendance::create([
                            'member_id' => $member->id,
                            'meeting_id' => $meeting->id,
                            'checked_in_at' => $checkInTime,
                            'created_at' => $checkInTime,
                            'updated_at' => $checkInTime,
                        ]);
                    }
                }
                
                // 20% sisanya alpa (tidak ada record attendance)
                
                $attendedCount = Attendance::where('meeting_id', $meeting->id)->count();
                $this->command->info("  → {$attendedCount} mahasiswa hadir (dari {$totalMembers})");
            }
        }

        $this->command->info("\n✅ Meeting and attendance seeding completed!");
        $this->command->info("Summary:");
        $this->command->info("  - Total meetings: " . Meeting::count());
        $this->command->info("  - Active sessions: " . Meeting::where('is_open', true)->count());
        $this->command->info("  - Total attendances: " . Attendance::count());
    }
}
