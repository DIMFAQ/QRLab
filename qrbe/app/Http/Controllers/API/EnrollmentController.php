<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EnrollmentController extends Controller
{
    // GET /api/admin/enrollments - Lihat semua enrollment
    public function index(Request $request)
    {
        $enrollments = Enrollment::with(['member', 'course', 'praktikumClass'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($enrollments);
    }

    // POST /api/admin/enrollments - Daftarkan mahasiswa ke praktikum & kelas
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'member_id' => 'required|exists:members,id',
            'course_id' => 'required|exists:courses,id',
            'class_id' => 'required|exists:classes,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        // Cek duplikat
        $exists = Enrollment::where('member_id', $request->member_id)
            ->where('course_id', $request->course_id)
            ->where('class_id', $request->class_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Mahasiswa sudah terdaftar di praktikum & kelas ini'], 400);
        }

        $enrollment = Enrollment::create($request->all());

        return response()->json([
            'message' => 'Enrollment berhasil ditambahkan',
            'enrollment' => $enrollment->load(['member', 'course', 'praktikumClass'])
        ], 201);
    }

    // DELETE /api/admin/enrollments/{id} - Hapus enrollment
    public function destroy($id)
    {
        $enrollment = Enrollment::find($id);

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment tidak ditemukan'], 404);
        }

        $enrollment->delete();

        return response()->json(['message' => 'Enrollment berhasil dihapus']);
    }

    // GET /api/admin/members/{memberId}/enrollments - Lihat enrollment mahasiswa tertentu
    public function getMemberEnrollments($memberId)
    {
        $member = Member::with(['enrollments.course', 'enrollments.praktikumClass'])->find($memberId);

        if (!$member) {
            return response()->json(['message' => 'Mahasiswa tidak ditemukan'], 404);
        }

        return response()->json($member->enrollments);
    }
}
