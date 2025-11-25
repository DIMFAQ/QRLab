<?php

use Illuminate\Support\Facades\Route;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Meeting;
use Carbon\Carbon;

Route::get('/test/data', function () {
    $today = Carbon::today();
    
    $meeting = Meeting::first();
    $meetingData = null;
    if ($meeting) {
        $meetingData = [
            'meeting_id' => $meeting->id,
            'meeting_name' => $meeting->name,
            'attendances' => $meeting->attendances()->with('member')->get()->map(function($att) {
                return [
                    'student_id' => $att->member->student_id ?? null,
                    'name' => $att->member->name ?? null,
                    'checked_in_at' => $att->checked_in_at,
                ];
            }),
        ];
    }
    
    return [
        'today' => $today->toDateString(),
        'total_members' => Member::count(),
        'total_attendances' => Attendance::count(),
        'attendances_today_created_at' => Attendance::whereDate('created_at', $today)->count(),
        'attendances_today_checked_in_at' => Attendance::whereDate('checked_in_at', $today)->count(),
        'sample_attendances' => Attendance::with('member')->limit(3)->get()->map(function($att) {
            return [
                'id' => $att->id,
                'member_id' => $att->member_id,
                'student_id' => $att->member->student_id ?? null,
                'name' => $att->member->name ?? null,
                'checked_in_at' => $att->checked_in_at,
                'created_at' => $att->created_at,
                'date_checked_in' => $att->checked_in_at ? Carbon::parse($att->checked_in_at)->toDateString() : null,
            ];
        }),
        'sample_meeting_rekap' => $meetingData,
    ];
});
