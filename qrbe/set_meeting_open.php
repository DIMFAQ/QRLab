<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Meeting;

$meeting = Meeting::first();
if ($meeting) {
    $meeting->status = 'open';
    $meeting->save();
    echo "Meeting {$meeting->id} set to open\n";
} else {
    echo "No meetings found\n";
}
