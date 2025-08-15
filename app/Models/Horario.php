<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{

    use HasFactory;
    protected $fillable = [
        'agenda_id',
        'reserva_id',
        'horario_inicio',
        'horario_fim',
        'data',
        'situacao',
        'justificativa',
        'user_id',
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class);
    }
    public function agenda()
    {
        return $this->belongsTo(Agenda::class);
    }

    public function avaliador() {
        return $this->belongsTo(User::class);
    }
}
