<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Member;
use App\Models\Attendance;

class PraktikanController extends Controller
{
    // Ambil profil user praktikan
    public function me(Request $request)
    {
        $user = $request->user();
        $member = Member::where('user_id', $user->id)->first();

        return response()->json([
            'name' => $user->name,
            'student_id' => $member->student_id ?? '',
            'class_group' => $member->class_group ?? '',
            'phone' => $member->phone ?? '',
        ]);
    }

    // Update profil praktikan
    public function update(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'student_id' => 'required|string|max:50',
            'class_group' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update(['name' => $data['name']]);

        Member::updateOrCreate(
            ['user_id' => $user->id],
            [
                'student_id' => $data['student_id'],
                'class_group' => $data['class_group'] ?? null,
                'phone' => $data['phone'] ?? null,
            ]
        );

        return response()->json(['message' => 'Profil berhasil diperbarui.']);
    }

    // Ambil riwayat presensi
    public function riwayat(Request $request)
    {
        $user = $request->user();
        $member = Member::where('user_id', $user->id)->first();

        if (!$member) {
            return response()->json([]);
        }

        $items = Attendance::where('member_id', $member->id)
            ->with('meeting:id,name,meeting_number')
            ->latest()
            ->take(30)
            ->get()
            ->map(fn($a) => [
                'meeting_name' => $a->meeting->name ?? null,
                'meeting_number' => $a->meeting->meeting_number ?? null,
                'checked_at' => $a->updated_at,
                'status' => $a->status ? 'Hadir' : 'Tidak Hadir',
            ]);

        return response()->json($items);
    }
}
