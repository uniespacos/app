<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    /** @use HasFactory<\Database\Factories\ReservaFactory> */
    use HasFactory;

    protected $fillable = [
        'titulo',
        'descricao',
        'situacao',
        'espaco_id',
        'data_inicial',
        'data_final',
        'recorrencia',
        'observacao',
        'situacao_id',
        'user_id',
        'validation_status',
        'conflict_cache',
        'cache_validated_at',
    ];

    protected $casts = [
        'conflict_cache' => 'array',
        'cache_validated_at' => 'datetime',
    ];

    public function horarios()
    {
        return $this->hasMany(Horario::class);
    }
    public function regras()
    {
        return $this->hasMany(RegraReserva::class);
    }
    public function espaco()
    {
        return $this->belongsTo(Espaco::class);
    }
    public function situacao()
    {
        return $this->belongsTo(SituacaoReserva::class, 'situacao');
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
