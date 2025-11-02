<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail // <- penting
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'email','password','role','member_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // relasi ke member (nama & npm disimpan di members)
    public function member()
    {
        return $this->belongsTo(\App\Models\Member::class, 'member_id');
    }
}
