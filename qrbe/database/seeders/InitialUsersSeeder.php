<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Member;
use Illuminate\Support\Facades\Hash;

class InitialUsersSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Member (Praktikan)
        $member = Member::create([
            'student_id' => '2021001',
            'name' => 'Praktikan Uji Coba',
        ]);

        // 2. Buat User Praktikan
        User::create([
            'name' => 'Praktikan',
            'email' => 'praktikan@test.com',
            'password' => Hash::make('password'), // Password: password
            'role' => 'praktikan',
            'member_id' => $member->id,
        ]);

        // 3. Buat User Admin
        User::create([
            'name' => 'Admin Lab',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'), // Password: password
            'role' => 'admin',
            'member_id' => null, // Admin tidak terikat Member
        ]);
    }
}