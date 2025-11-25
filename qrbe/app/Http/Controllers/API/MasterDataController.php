<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\PraktikumClass;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    public function getCourses()
    {
        $courses = Course::where('is_active', true)
            ->orderBy('code')
            ->get();
        
        return response()->json($courses);
    }

    public function getClasses()
    {
        $classes = PraktikumClass::where('is_active', true)
            ->orderBy('code')
            ->get();
        
        return response()->json($classes);
    }

    public function storeCourse(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:courses,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $course = Course::create($validated);

        return response()->json([
            'message' => 'Praktikum berhasil ditambahkan',
            'data' => $course
        ], 201);
    }

    public function storeClass(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:classes,code',
            'name' => 'required|string|max:255',
            'capacity' => 'nullable|integer|min:1',
        ]);

        $class = ClassModel::create($validated);

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan',
            'data' => $class
        ], 201);
    }

    public function updateCourse(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:courses,code,' . $id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $course->update($validated);

        return response()->json([
            'message' => 'Praktikum berhasil diperbarui',
            'data' => $course
        ]);
    }

    public function deleteCourse($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json([
            'message' => 'Praktikum berhasil dihapus'
        ]);
    }
}
