<?php
// Ganti [IP_LOKAL_ANDA] dengan 10.10.10.226
// Ganti [NGROK_URL_ANDA] dengan https://untouching-nonsupplementary-thiago.ngrok-free.dev

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        // Hapus '*' dan masukkan host yang spesifik
        'http://localhost:5173',
        'https://localhost:5173',
        
        // Host Lokal (akses dari HP/Laptop lain)
        'https://10.10.10.226:5173', 
        'http://10.10.10.226:5173',
        '*',
        
        // Host Ngrok (public)
        'https://untouching-nonsupplementary-thiago.ngrok-free.dev', 
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // <-- UBAH KE TRUE
];