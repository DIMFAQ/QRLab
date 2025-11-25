<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = ['student_id', 'name'];
    
    public function user() { return $this->hasOne(User::class); }
    public function attendances() { return $this->hasMany(Attendance::class); }
    
    // Many-to-many relationship
    public function enrollments() { 
        return $this->hasMany(Enrollment::class); 
    }
    
    public function courses() {
        return $this->belongsToMany(Course::class, 'enrollments')
            ->withPivot('class_id', 'is_active')
            ->withTimestamps();
    }
}