<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Load test routes for debugging
if (file_exists(__DIR__ . '/test.php')) {
    require __DIR__ . '/test.php';
}
