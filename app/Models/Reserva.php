<?php

namespace App\Models;

use Carbon\Carbon;
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

    /**
     * Obtém um resumo dos horários da reserva.
     * Se houver poucos horários, retorna a lista detalhada.
     * Se houver muitos, agrupa por dia da semana e intervalo de datas.
     */
    public function getResumoHorariosAttribute(): array
    {
        $horarios = $this->horarios()->with('agenda.espaco')->get();

        if ($horarios->count() <= 10) {
            return $horarios->map(fn ($h) => (object) [
                'is_summary' => false,
                'texto' => Carbon::parse($h->data)->format('d/m/Y').
                           ' das '.Carbon::parse($h->horario_inicio)->format('H:i').
                           ' às '.Carbon::parse($h->horario_fim)->format('H:i').
                           ' (Turno: '.$h->agenda->turno.')',
            ])->toArray();
        }

        $grouped = $horarios->groupBy(function ($h) {
            return $h->agenda_id.'-'.$h->horario_inicio.'-'.$h->horario_fim;
        });

        return $grouped->map(function ($group) {
            $first = $group->first();
            $dates = $group->pluck('data')->map(fn ($d) => Carbon::parse($d));
            $minDate = $dates->min()->format('d/m/Y');
            $maxDate = $dates->max()->format('d/m/Y');

            $daysOfWeek = $dates->map(function ($d) {
                return ucfirst($d->locale('pt_BR')->dayName);
            })->unique()->values();

            $diasTexto = $daysOfWeek->count() > 1
                ? $daysOfWeek->slice(0, -1)->implode(', ').' e '.$daysOfWeek->last()
                : $daysOfWeek->first();

            return (object) [
                'is_summary' => true,
                'texto' => "$diasTexto das ".
                           Carbon::parse($first->horario_inicio)->format('H:i').
                           ' às '.Carbon::parse($first->horario_fim)->format('H:i').
                           ' (Turno: '.$first->agenda->turno.') no espaço '.$first->agenda->espaco->nome.
                           " - período de $minDate a $maxDate (".$group->count().' sessões)',
            ];
        })->values()->toArray();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
