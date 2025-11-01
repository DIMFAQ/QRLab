<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // role string dengan default "praktikan"
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('praktikan')->index();
            }

            // member_id opsional (hapus kalau memang tidak perlu)
            if (!Schema::hasColumn('users', 'member_id')) {
                $table->unsignedBigInteger('member_id')->nullable()->index();
                // Kalau ada tabel "members", bisa aktifkan FK:
                // $table->foreign('member_id')->references('id')->on('members')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'member_id')) {
                // $table->dropForeign(['member_id']); // uncomment jika FK dibuat
                $table->dropColumn('member_id');
            }
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
        });
    }
};
