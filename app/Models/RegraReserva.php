<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegraReserva extends Model
{
    protected $fillable = [
        'reserva_id',
        'agenda_id',
        'dia_semana',
        'hora_inicio',
        'hora_fim',
        'situacao_id',
        'justificativa',
        'avaliador_id',
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class);
    }
    public function agenda()
    {
        return $this->belongsTo(Agenda::class);
    }

    function situacao()
    {
        return $this->hasOne(SituacaoReserva::class);
    }

    public function excecoes()
    {
        return $this->hasMany(ExcecaoReserva::class, 'regra_reserva_id');
    }

    public function avaliador()
    {
        return $this->belongsTo(User::class, 'avaliador_id');
    }


}
