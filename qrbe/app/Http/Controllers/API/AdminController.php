<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\QrSession;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function generateQrToken(Request $r)
    {
        if ($r->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }
        $token = Str::random(12);
        $expiry = now()->addMinutes(10);
        QrSession::truncate(); 
        $qrSession = QrSession::create([
            'token' => $token, 'expires_at' => $expiry, 'generated_by_user_id' => $r->user()->id,
        ]);
        return response()->json([
            'message' => 'Sesi QR Code berhasil dibuat.',
            'qr_token' => $qrSession->token,
            'expires_at' => $qrSession->expires_at->toDateTimeString(),
        ], 201);
    }

    public function getActiveQrToken(Request $r)
    {
        if ($r->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }
        $session = QrSession::where('expires_at', '>', now())->first();
        if (!$session) {
            return response()->json(['message' => 'Tidak ada sesi QR yang aktif saat ini.'], 404);
        }
        return response()->json([
            'qr_token' => $session->token,
            'expires_at' => $session->expires_at->toDateTimeString(),
            'minutes_left' => now()->diffInMinutes($session->expires_at) 
        ]);
    }
}