<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User; // Pastikan ini ada
use App\Models\Member;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            $user->tokens()->delete(); 
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user->load('member'), 
                'token' => $token,
                'message' => 'Login berhasil!'
            ]);
        }
        return response()->json(['message' => 'Email atau Password salah'], 401);
    }
    
    public function me(Request $request) { return response()->json($request->user()->load('member')); }
    public function logout(Request $request) { $request->user()->currentAccessToken()->delete(); return response()->json(['message' => 'Logout berhasil.']); }
}