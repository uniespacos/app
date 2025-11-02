<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExcecaoReserva extends Model
{
    protected $fillable = [
        'regra_reserva_id',
        'data_excecao',
        'hora_inicio',
        'hora_fim',
        'situacao_id',
        'justificativa',
        'criado_por',
    ];

    public function regra()
    {
        return $this->belongsTo(RegraReserva::class, 'regra_reserva_id');
    }
    public function criadoPor()
    {
        return $this->belongsTo(User::class, 'criado_por');
    }

    public function situacao()
    {
        return $this->hasOne(SituacaoReserva::class, 'situacao_id');
    }
}
