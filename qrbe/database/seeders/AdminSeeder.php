<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Member;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // CREATE ADMIN USER
        if (!User::where('email', 'admin@example.com')->exists()) {
            User::create([
                'name'        => 'Super Admin',
                'email'       => 'admin@example.com',
                'password'    => Hash::make('admin123'),
                'role'        => 'admin',
                'is_verified' => true,
                'member_id'   => null,
            ]);
        }

        // CREATE DEFAULT PRAKTIKAN USER
        if (!User::where('email', 'user@example.com')->exists()) {
            $member = Member::create([
                'student_id'  => 'P001',
                'name'        => 'User Praktikan',
                'class_group' => 'A1',
                'phone'       => '08123456789'
            ]);

            User::create([
                'name'        => 'User Praktikan',
                'email'       => 'user@example.com',
                'password'    => Hash::make('user123'),
                'role'        => 'praktikan',
                'is_verified' => true,
                'member_id'   => $member->id,
            ]);
        }
    }
}
