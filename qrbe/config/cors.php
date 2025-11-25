
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        // Development local
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://localhost:5173',
        
        // Network IP access (ganti dengan IP Anda jika perlu)
        'http://192.168.1.9:5173',
        
        // Ngrok URLs - UPDATE SETIAP KALI NGROK RESTART
        // Ganti dengan frontend ngrok URL Anda
        // Contoh: 'https://xyz789.ngrok-free.app'
        env('FRONTEND_URL', '*'), // Baca dari .env
        
        // Fallback untuk development
        '*', // PERINGATAN: Hapus di production!
    ],

    'allowed_origins_patterns' => [
        // Allow semua subdomain ngrok
        '/^https:\/\/.*\.ngrok-free\.app$/',
        '/^https:\/\/.*\.ngrok\.io$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // TRUE untuk cookies/session dengan ngrok

];
