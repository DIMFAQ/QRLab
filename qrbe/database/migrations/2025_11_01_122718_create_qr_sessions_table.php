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
            $table->string('token', 20)->unique(); 
            $table->timestamp('expires_at'); 
            $table->foreignId('generated_by_user_id')->constrained('users')->cascadeOnDelete(); 
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('qr_sessions'); }
};