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

    // POST /api/admin/enrollments/bulk - Bulk enrollment (many mahasiswa to many praktikum)
    public function bulkStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'member_ids' => 'required|array|min:1',
            'member_ids.*' => 'exists:members,id',
            'course_id' => 'required|exists:courses,id',
            'class_id' => 'required|exists:classes,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $created = 0;
        $skipped = 0;
        $errors = [];

        foreach ($request->member_ids as $memberId) {
            // Cek duplikat
            $exists = Enrollment::where('member_id', $memberId)
                ->where('course_id', $request->course_id)
                ->where('class_id', $request->class_id)
                ->exists();

            if ($exists) {
                $skipped++;
                $member = Member::find($memberId);
                $errors[] = "Skip: {$member->student_id} - {$member->name} (sudah terdaftar)";
                continue;
            }

            Enrollment::create([
                'member_id' => $memberId,
                'course_id' => $request->course_id,
                'class_id' => $request->class_id,
                'is_active' => $request->is_active ?? true,
            ]);

            $created++;
        }

        return response()->json([
            'message' => "Berhasil: $created enrollment dibuat, $skipped dilewati (duplikat)",
            'created' => $created,
            'skipped' => $skipped,
            'errors' => $errors
        ], 201);
    }

    // POST /api/admin/enrollments/bulk-advanced - Advanced bulk enrollment (many mahasiswa to many praktikum to many kelas)
    public function bulkStoreAdvanced(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'member_ids' => 'required|array|min:1',
            'member_ids.*' => 'exists:members,id',
            'course_ids' => 'required|array|min:1',
            'course_ids.*' => 'exists:courses,id',
            'class_ids' => 'required|array|min:1',
            'class_ids.*' => 'exists:classes,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $created = 0;
        $skipped = 0;
        $errors = [];
        $totalAttempted = count($request->member_ids) * count($request->course_ids) * count($request->class_ids);

        // Triple nested loop: students × courses × classes
        foreach ($request->member_ids as $memberId) {
            $member = Member::find($memberId);
            
            foreach ($request->course_ids as $courseId) {
                $course = \App\Models\Course::find($courseId);
                
                foreach ($request->class_ids as $classId) {
                    $class = \App\Models\PraktikumClass::find($classId);
                    
                    // Cek duplikat
                    $exists = Enrollment::where('member_id', $memberId)
                        ->where('course_id', $courseId)
                        ->where('class_id', $classId)
                        ->exists();

                    if ($exists) {
                        $skipped++;
                        $errors[] = sprintf(
                            "%s (%s) sudah terdaftar di %s - %s",
                            $member->name,
                            $member->student_id,
                            $course->code,
                            $class->name
                        );
                        continue;
                    }

                    Enrollment::create([
                        'member_id' => $memberId,
                        'course_id' => $courseId,
                        'class_id' => $classId,
                        'is_active' => $request->is_active ?? true,
                    ]);

                    $created++;
                }
            }
        }

        return response()->json([
            'message' => "Berhasil: $created enrollment dibuat, $skipped dilewati (duplikat)",
            'total_attempted' => $totalAttempted,
            'created' => $created,
            'skipped' => $skipped,
            'errors' => $errors
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

    // PATCH /api/admin/enrollments/{id} - Update enrollment (toggle status)
    public function update(Request $request, $id)
    {
        $enrollment = Enrollment::find($id);

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $enrollment->update($validated);

        return response()->json([
            'message' => 'Status enrollment berhasil diubah',
            'enrollment' => $enrollment->load(['member', 'course', 'praktikumClass'])
        ]);
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
