<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PraktikumClass extends Model
{
    protected $table = 'classes';
    
    protected $fillable = ['code', 'name', 'capacity', 'is_active'];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
    
    public function members()
    {
        return $this->hasMany(Member::class, 'class_id');
    }
    
    public function meetings()
    {
        return $this->hasMany(Meeting::class, 'class_id');
    }
}
