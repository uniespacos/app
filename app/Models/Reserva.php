<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SituacaoReserva\ModoArquivoEnum;
use Carbon\Carbon;
use Database\Factories\ReservaFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property bool $can_update Set dynamically in ReservaService based on policy check.
 * @property string|null $existing_justification Set dynamically in ReservaService with first non-null justificativa.
 */
class Reserva extends Model
{
    /** @use HasFactory<ReservaFactory> */
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

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'conflict_cache' => 'array',
        'cache_validated_at' => 'datetime',
    ];

    /**
     * Aplica o eixo de arquivamento a uma listagem (issue #108).
     *
     * Fica no model, e nao em cada repositorio, porque a regra estava escrita
     * de duas formas divergentes: getPaginatedForGestor tinha o default certo,
     * e getPaginatedForUser aplicava `!= 'inativa'` incondicionalmente — o que
     * transformava um filtro por arquivadas na contradicao
     * `situacao != 'inativa' AND situacao = 'inativa'`. Uma definicao so
     * elimina a chance de as duas divergirem de novo.
     *
     * @param  Builder<Reserva>  $query
     * @return Builder<Reserva>
     */
    public function scopeArquivo(Builder $query, mixed $modo): Builder
    {
        return match (ModoArquivoEnum::fromFiltro($modo)) {
            ModoArquivoEnum::ARQUIVADAS => $query->where('situacao', 'inativa'),
            ModoArquivoEnum::TODAS => $query,
            ModoArquivoEnum::ATIVAS => $query->where('situacao', '!=', 'inativa'),
        };
    }

    /**
     * Returns a human-readable label for the current situacao value.
     */
    public function getSituacaoFormatadaAttribute(): string
    {
        return match ($this->situacao) {
            'em_analise' => 'Em Análise',
            'deferida' => 'Deferida',
            'indeferida' => 'Indeferida',
            'parcialmente_deferida' => 'Parcialmente Deferida',
            /** @phpstan-ignore match.alwaysTrue */
            'inativa' => 'Inativa',
            default => ucfirst(str_replace('_', ' ', $this->situacao)),
        };
    }

    /**
     * Returns a summary of the reservation's horarios.
     * For 10 or fewer horarios, returns a detailed list.
     * For larger sets, groups by agenda/time slot showing date ranges and days of the week.
     *
     * @return array<int, object>
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

            $daysOfWeek = $dates->map(fn ($d) => ucfirst($d->locale('pt_BR')->dayName))->unique()->values();

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

    /**
     * @return HasMany<Horario, $this>
     */
    public function horarios(): HasMany
    {
        return $this->hasMany(Horario::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
