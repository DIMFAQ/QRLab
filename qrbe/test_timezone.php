<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Carbon\Carbon;

echo "=== TIMEZONE TEST ===\n\n";

// Test 1: Config timezone
$configTimezone = config('app.timezone');
echo "1. Config Timezone: {$configTimezone}\n";

// Test 2: Current time
$now = Carbon::now();
echo "2. Carbon::now(): {$now}\n";
echo "   Timezone: {$now->timezone->getName()}\n";

// Test 3: Parse datetime-local format (yang dikirim dari frontend)
$datetimeLocal = "2025-11-25T15:30"; // Format dari input datetime-local
$parsed = Carbon::parse($datetimeLocal, 'Asia/Jakarta');
echo "\n3. Parse '{$datetimeLocal}' with Asia/Jakarta:\n";
echo "   Result: {$parsed}\n";
echo "   Timezone: {$parsed->timezone->getName()}\n";
echo "   ISO: {$parsed->toIso8601String()}\n";

// Test 4: Simpan ke database format
echo "\n4. Database format:\n";
echo "   {$parsed->toDateTimeString()}\n";

// Test 5: Baca kembali dari database
$fromDb = Carbon::parse($parsed->toDateTimeString());
echo "\n5. Read from DB:\n";
echo "   Result: {$fromDb}\n";
echo "   Timezone: {$fromDb->timezone->getName()}\n";

echo "\n✅ All times using Asia/Jakarta (GMT+7)\n";
