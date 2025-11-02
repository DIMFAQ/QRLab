<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $fillable = ['name', 'meeting_number', 'start_time', 'end_time', 'qr_duration_minutes', 'is_open', 'user_id'];
    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_open' => 'boolean',
    ];
    public function tokens() { return $this->hasMany(MeetingToken::class); }
    public function attendances() { return $this->hasMany(Attendance::class, 'meeting_id'); }
    public function admin() { return $this->belongsTo(User::class, 'user_id'); }
}