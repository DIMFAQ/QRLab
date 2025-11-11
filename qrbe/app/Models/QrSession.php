<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class QrSession extends Model
{
    protected $fillable = ['token', 'expires_at', 'generated_by_user_id'];
    protected $casts = ['expires_at' => 'datetime'];
    public function generatedBy() { return $this->belongsTo(User::class, 'generated_by_user_id'); }
}