<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            // Add unique constraint untuk course_id + class_id + meeting_number
            // Memastikan tidak ada duplikasi pertemuan untuk kombinasi yang sama
            $table->unique(['course_id', 'class_id', 'meeting_number'], 'unique_course_class_meeting');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            // Drop unique constraint saat rollback
            $table->dropUnique('unique_course_class_meeting');
        });
    }
};
