<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_sessions', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke meeting (bisa null untuk QR Global)
            $table->foreignId('meeting_id')
                  ->nullable() // PENTING: Memperbolehkan NULL untuk sesi QR Global
                  ->constrained('meetings')
                  ->cascadeOnDelete(); // Hapus sesi QR jika meeting dihapus

            // Token QR, dibuat 64 char untuk mengakomodasi Str::random(40)
            $table->string('token', 64)->unique(); 
            
            $table->timestamp('expires_at'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void 
    { 
        Schema::dropIfExists('qr_sessions'); 
    }
};