<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['member_id','checked_in_at', 'meeting_id'];
    protected $casts = ['checked_in_at'=>'datetime'];
    public $timestamps = true;
    public function member() { return $this->belongsTo(Member::class); }
    public function meeting() { return $this->belongsTo(Meeting::class); }
}