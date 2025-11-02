<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MeetingToken extends Model
{
    protected $fillable = ['meeting_id', 'token', 'expires_at'];
    protected $casts = ['expires_at' => 'datetime'];
    public function meeting() { return $this->belongsTo(Meeting::class); }
}