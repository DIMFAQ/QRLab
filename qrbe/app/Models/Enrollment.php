<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    protected $fillable = ['member_id', 'course_id', 'class_id', 'is_active'];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
    
    public function member()
    {
        return $this->belongsTo(Member::class);
    }
    
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
    
    public function praktikumClass()
    {
        return $this->belongsTo(PraktikumClass::class, 'class_id');
    }
}
