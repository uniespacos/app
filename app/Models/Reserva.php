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
        'data_inicial',
        'data_final',
        'recorrencia',
        'observacao',
        'user_id',
        'validation_status',
        'conflict_cache',
        'cache_validated_at',
    ];

    protected $casts = [
        'conflict_cache' => 'array',
        'cache_validated_at' => 'datetime',
    ];

    // Accessor para formatar a situação para exibição
    public function getSituacaoFormatadaAttribute(): string
    {
        return match ($this->situacao) {
            'em_analise' => 'Em Análise',
            'deferida' => 'Deferida',
            'indeferida' => 'Indeferida',
            'parcialmente_deferida' => 'Parcialmente Deferida',
            'inativa' => 'Inativa',
            default => ucfirst(str_replace('_', ' ', $this->situacao)),
        };
    }

    public function horarios()
    {
        return $this->hasMany(Horario::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
