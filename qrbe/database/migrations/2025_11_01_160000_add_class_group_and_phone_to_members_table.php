<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (!Schema::hasColumn('members', 'class_group')) {
                $table->string('class_group')->nullable()->after('name');
            }
            if (!Schema::hasColumn('members', 'phone')) {
                $table->string('phone')->nullable()->after('class_group');
            }
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (Schema::hasColumn('members', 'class_group')) {
                $table->dropColumn('class_group');
            }
            if (Schema::hasColumn('members', 'phone')) {
                $table->dropColumn('phone');
            }
        });
    }
};
