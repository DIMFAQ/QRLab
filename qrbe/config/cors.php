
<?php
// ...
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    // UBAH BARIS INI: Pastikan mendukung domain frontend Anda
    'allowed_origins' => ['http://localhost:5173'], // HANYA IZINKAN VITE
    // Jika masih gagal, ganti dengan: ['*'] (Kurang aman, tapi untuk uji coba)

    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'allowed_methods' => ['*'],

    // INI WAJIB TRUE untuk otorisasi Sanctum/Session
    'supports_credentials' => true, 
];
// ...