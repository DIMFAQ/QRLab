<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel master praktikum/mata kuliah
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // Kode MK (e.g., IF101)
            $table->string('name'); // Nama Praktikum
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabel master kelas
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // Kode Kelas (e.g., A, B, C)
            $table->string('name'); // Nama Kelas
            $table->integer('capacity')->default(40); // Kapasitas
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Update tabel meetings untuk relasi ke courses dan classes
        Schema::table('meetings', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->after('id')->constrained('courses')->nullOnDelete();
            $table->foreignId('class_id')->nullable()->after('course_id')->constrained('classes')->nullOnDelete();
            
            // Tetap pertahankan kolom name untuk backward compatibility
            // Tapi akan diisi otomatis dari course + class
        });
    }

    public function down(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropForeign(['class_id']);
            $table->dropColumn(['course_id', 'class_id']);
        });
        
        Schema::dropIfExists('classes');
        Schema::dropIfExists('courses');
    }
};
