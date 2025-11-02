<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama Kelas/Mata Kuliah
            $table->integer('meeting_number'); // Pertemuan Ke-
            $table->dateTime('start_time'); // Waktu mulai sesi
            $table->dateTime('end_time'); // Waktu selesai sesi
            $table->integer('qr_duration_minutes')->default(5); // Durasi QR aktif
            $table->boolean('is_open')->default(true); // Status sesi (terbuka/tertutup)
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Admin pembuat
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('meetings'); }
};
