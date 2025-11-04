<?php

namespace App\Repositories;

use App\Models\Espaco;
use App\Models\Reserva;
use Illuminate\Pagination\LengthAwarePaginator;
use JasonGuru\LaravelMakeRepository\Repository\BaseRepository;

/**
 * Class ReservaRepository.
 */
class ReservaRepository extends BaseRepository
{
    /**
     * @return string
     *  Return the model
     */
    public function model()
    {
        return Reserva::class;
    }

    /**
     * Busca a lista paginada de reservas para o usuário.
     * (A query complexa do seu 'index')
     */
    public function getReservasPaginadasDoUsuario(
        int $userId,
        string $inicioSemana,
        string $fimSemana,
        array $filters = []
    ): LengthAwarePaginator {
        return Reserva::query()
            ->where('user_id', $userId)
            ->where('situacao', '!=', 'inativa')
            ->where(function ($query) use ($inicioSemana, $fimSemana) {
                $query->where('data_inicial', '<=', $fimSemana)
                    ->where('data_final', '>=', $inicioSemana);
            })
            ->when($filters['search'] ?? null, /* ... */)
            ->when($filters['situacao'] ?? null, /* ... */)
            ->with([
                'horarios' => function ($query) use ($inicioSemana, $fimSemana) {
                    $query->whereBetween('data', [$inicioSemana, $fimSemana])
                        ->orderBy('data')->orderBy('horario_inicio')
                        ->with(['agenda.espaco']);
                },
                'user:id,name'
            ])
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }
    public function getReservasPaginadasDoGestor(
        array $agendasDoGestorIds,
        string $a,
        string $fimSemana,
        array $filters = []
    ): LengthAwarePaginator {
        return Reserva::query()
            ->select(['id', 'titulo', 'descricao', 'situacao', 'user_id', 'data_inicial', 'data_final'])
            ->whereHas('horarios', fn($q) => $q->whereIn('agenda_id', $agendasDoGestorIds))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(fn($q) => $q->where('titulo', 'like', "%{$search}%")->orWhere('descricao', 'like', "%{$search}%"));
            })
            ->when($filters['situacao'] ?? null, fn($q, $s) => $q->where('situacao', $s), fn($q) => $q->where('situacao', '!=', 'inativa'))
            ->with([
                'user:id,name',
                'horarios' => function ($query) use ($agendasDoGestorIds) {
                    $query->whereIn('agenda_id', $agendasDoGestorIds)->limit(1)->with([
                        // CORREÇÃO: Adicionado 'turno' ao select da agenda
                        'agenda:id,espaco_id,turno',
                        'agenda.espaco:id,nome'
                    ]);
                }
            ])
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }
    /**
     * Busca a reserva específica para o modal (Show).
     */
    public function getReservaParaModal(
        int $reservaId,
        string $inicioSemana,
        string $fimSemana
    ): ?Reserva {
        return Reserva::with([
            'user',
            'horarios' => function ($query) use ($inicioSemana, $fimSemana) {
                $query->whereBetween('data', [$inicioSemana, $fimSemana])
                    ->orderBy('data')->orderBy('horario_inicio')
                    ->with(['agenda.espaco.andar.modulo.unidade', 'avaliador']);
            },
        ])->find($reservaId);
    }

    /**
     * Busca os dados do Espaço para a tela de edição.
     * (A query complexa do seu 'edit')
     */
    public function getEspacoParaEditar(
        Reserva $reserva,
        string $inicioSemana,
        string $fimSemana
    ): Espaco {
        // 1. Lógica de Fallback do Espaço
        $espaco = $reserva->horarios->first()->agenda->espaco ?? null;
        if (!$espaco) {
            $espaco = Espaco::whereHas('agendas.horarios.reserva', fn($q) => $q->where('id', $reserva->id))->firstOrFail();
        }

        // 2. Carregar dados do Espaço
        $espaco->load([
            'andar.modulo.unidade.instituicao',
            'agendas' => function ($query) use ($inicioSemana, $fimSemana) {
                $query->with([
                    'user.setor',
                    'horarios' => function ($q) use ($inicioSemana, $fimSemana) {
                        $q->where('situacao', 'deferida')
                            ->whereBetween('data', [$inicioSemana, $fimSemana])
                            ->with(['reserva.user', 'avaliador']);
                    }
                ]);
            }
        ]);

        return $espaco;
    }

}
