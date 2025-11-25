<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    // GET /api/profile - Get user profile with photo
    public function show(Request $request)
    {
        $user = $request->user()->load('member');
        
        $photoUrl = null;
        if ($user->profile_photo) {
            // Return relative URL untuk compatibility dengan proxy
            $photoUrl = '/storage/' . $user->profile_photo;
        }
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'profile_photo' => $photoUrl,
            'member' => $user->member ? [
                'student_id' => $user->member->student_id,
                'name' => $user->member->name,
            ] : null,
        ]);
    }

    // POST /api/profile/photo - Upload profile photo
    public function uploadPhoto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,jpg,png|max:2048', // max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Hapus foto lama jika ada
        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        // Upload foto baru
        $file = $request->file('photo');
        $filename = 'profile_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('profile_photos', $filename, 'public');

        // Update user
        $user->profile_photo = $path;
        $user->save();

        return response()->json([
            'message' => 'Foto profil berhasil diupload',
            'profile_photo' => '/storage/' . $path,
        ]);
    }

    // DELETE /api/profile/photo - Delete profile photo
    public function deletePhoto(Request $request)
    {
        $user = $request->user();

        if (!$user->profile_photo) {
            return response()->json([
                'message' => 'Tidak ada foto profil'
            ], 404);
        }

        // Hapus file
        Storage::disk('public')->delete($user->profile_photo);

        // Update user
        $user->profile_photo = null;
        $user->save();

        return response()->json([
            'message' => 'Foto profil berhasil dihapus'
        ]);
    }

    // PUT /api/profile - Update profile name/email
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diupdate',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }
}
