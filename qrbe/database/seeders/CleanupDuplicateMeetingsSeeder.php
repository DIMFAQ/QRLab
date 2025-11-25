<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Meeting;
use Illuminate\Support\Facades\DB;

class CleanupDuplicateMeetingsSeeder extends Seeder
{
    public function run()
    {
        // Cari meeting yang duplikat berdasarkan course_id, class_id, meeting_number
        $duplicates = DB::table('meetings')
            ->select('course_id', 'class_id', 'meeting_number', DB::raw('COUNT(*) as count'))
            ->groupBy('course_id', 'class_id', 'meeting_number')
            ->having('count', '>', 1)
            ->get();

        echo "Found " . $duplicates->count() . " duplicate combinations\n";

        foreach ($duplicates as $dup) {
            echo "\nProcessing: Course {$dup->course_id}, Class {$dup->class_id}, Meeting {$dup->meeting_number}\n";
            
            // Ambil semua meeting dengan kombinasi yang sama
            $meetings = Meeting::where('course_id', $dup->course_id)
                              ->where('class_id', $dup->class_id)
                              ->where('meeting_number', $dup->meeting_number)
                              ->orderBy('created_at', 'asc')
                              ->get();

            echo "  Found {$meetings->count()} meetings\n";
            
            // Simpan yang pertama (yang paling lama), hapus sisanya
            $keepFirst = $meetings->first();
            echo "  Keeping meeting ID: {$keepFirst->id} (created: {$keepFirst->created_at})\n";
            
            foreach ($meetings->skip(1) as $meeting) {
                echo "  Deleting meeting ID: {$meeting->id} (created: {$meeting->created_at})\n";
                
                // Pindahkan attendance ke meeting yang di-keep (jika ada)
                $attendanceCount = $meeting->attendances()->count();
                if ($attendanceCount > 0) {
                    echo "    Moving {$attendanceCount} attendances to meeting {$keepFirst->id}\n";
                    $meeting->attendances()->update(['meeting_id' => $keepFirst->id]);
                }
                
                // Hapus tokens
                $tokenCount = $meeting->tokens()->count();
                if ($tokenCount > 0) {
                    echo "    Deleting {$tokenCount} tokens\n";
                    $meeting->tokens()->delete();
                }
                
                // Hapus meeting
                $meeting->delete();
            }
        }

        echo "\nCleanup completed!\n";
        echo "Total meetings now: " . Meeting::count() . "\n";
    }
}
