<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = ['student_id', 'name'];
    public function user() { return $this->hasOne(User::class); }
    public function attendances() { return $this->hasMany(Attendance::class); }
}