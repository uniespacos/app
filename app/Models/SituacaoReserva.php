<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SituacaoReserva extends Model
{
    protected $fillable = [
        'nome',
        'slug',
    ];

    public function regras()
    {
        return $this->hasMany(RegraReserva::class, 'situacao_id');
    }
    public function excecoes()
    {
        return $this->hasMany(ExcecaoReserva::class, 'situacao_id');
    }
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'situacao');
    }
}
