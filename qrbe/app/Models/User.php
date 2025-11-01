<?php
namespace App\Models;

use Laravel\Sanctum\HasApiTokens; // WAJIB ADA
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    // WAJIB ADA HasApiTokens DI SINI
    use HasApiTokens, HasFactory, Notifiable; 

    protected $fillable = [
        'name', 'email', 'password', 'role', 'member_id',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    
    public function member() 
    {
        // Relasi ini harus ada untuk $user->load('member')
        return $this->belongsTo(Member::class);
    }
}