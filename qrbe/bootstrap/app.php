
<?php

use Illuminate\Foundation\Application;
use App\Http\Middleware\IsAdmin; // Ini sudah benar
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        
        // --- BLOK INI ADALAH PENAMBAHAN WAJIB ---
        $middleware->alias([
            'is_admin' => IsAdmin::class, // UBAH MENJADI 'is_admin' agar sama dengan di file routes/api.php
        ]);
        // ----------------------------------------

        $middleware->group('api', [
            // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, // DISABLE untuk Bearer Token API
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();