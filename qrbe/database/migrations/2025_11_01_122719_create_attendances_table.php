<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->nullable()->constrained()->cascadeOnDelete(); // BARU: Tambahkan meeting_id
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->timestamp('checked_in_at');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('attendances'); }
};