<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Member;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdditionalMembersSeeder extends Seeder
{
    public function run()
    {
        $members = [
            ['student_id' => '231506180', 'name' => 'Ahmad Rizki', 'email' => 'ahmad.rizki@example.com'],
            ['student_id' => '231506181', 'name' => 'Siti Nurhaliza', 'email' => 'siti.nurhaliza@example.com'],
            ['student_id' => '231506182', 'name' => 'Budi Santoso', 'email' => 'budi.santoso@example.com'],
            ['student_id' => '231506183', 'name' => 'Dewi Lestari', 'email' => 'dewi.lestari@example.com'],
            ['student_id' => '231506184', 'name' => 'Eko Prasetyo', 'email' => 'eko.prasetyo@example.com'],
            ['student_id' => '231506185', 'name' => 'Fitri Handayani', 'email' => 'fitri.handayani@example.com'],
            ['student_id' => '231506186', 'name' => 'Gunawan Wijaya', 'email' => 'gunawan.wijaya@example.com'],
            ['student_id' => '231506187', 'name' => 'Hana Pertiwi', 'email' => 'hana.pertiwi@example.com'],
        ];

        foreach ($members as $memberData) {
            // Create member first
            $member = Member::create([
                'student_id' => $memberData['student_id'],
                'name' => $memberData['name'],
            ]);

            // Create user with member_id
            User::create([
                'name' => $memberData['name'],
                'email' => $memberData['email'],
                'password' => Hash::make('password123'),
                'role' => 'praktikan',
                'email_verified_at' => now(), // Auto verified
                'member_id' => $member->id,
            ]);

            $this->command->info("Created: {$memberData['name']} ({$memberData['student_id']})");
        }

        $this->command->info("\n✅ Created " . count($members) . " additional members!");
        $this->command->info("Total members now: " . Member::count());
    }
}
