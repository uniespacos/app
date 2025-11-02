<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agenda extends Model
{
    use HasFactory;
    protected $fillable = [
        'turno',
        'espaco_id',
        'user_id'
    ];
    public function espaco()
    {
        return $this->belongsTo(Espaco::class);
    }
    public function horarios()
    {
        return $this->hasMany(Horario::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function regras(): HasMany
    {
        return $this->hasMany(RegraReserva::class, 'agenda_id');
    }

}
