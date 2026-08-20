<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Reserva;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ReservaRepositoryEloquent implements ReservaRepositoryInterface
{
    public function __construct(
        protected Reserva $reserva,
    ) {}

    /**
     * Stores a new instance of Reserva in the database
     */
    public function store(array $data): Reserva
    {
        return $this->reserva->create($data);
    }

    /**
     * Returns all instances of Reserva from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, Reserva>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection
    {
        $query = $this->reserva->newQuery();

        if ($filters) {
            $query->where($filters);
        }

        return $query->get($columns);
    }

    /**
     * Returns a paginated list of Reserva for a specific user, filtered by week and optional criteria
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPaginatedForUser(int $userId, string $weekStart, string $weekEnd, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->reserva->newQuery()
            ->where('user_id', $userId)
            ->where('situacao', '!=', 'inativa')
            ->when($filters['search'] ?? null, fn ($q, $s) => $q->where('titulo', 'like', '%'.$s.'%'))
            ->when($filters['situacao'] ?? null, fn ($q, $s) => $q->where('situacao', $s))
            ->with([
                'horarios' => function ($query) use ($weekStart, $weekEnd) {
                    $query->whereBetween('data', [$weekStart, $weekEnd])
                        ->orderBy('data')->orderBy('horario_inicio')
                        // Issue #105: a listagem exibe espaço + módulo na coluna "Local".
                        ->with(['agenda.espaco.andar.modulo']);
                },
                'user:id,name',
            ])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Returns a Reserva with its week-filtered horarios for the detail modal
     */
    public function findWithWeekSlots(int $reservaId, string $weekStart, string $weekEnd): ?Reserva
    {
        return $this->reserva->with([
            'user',
            'horarios' => function ($query) use ($weekStart, $weekEnd) {
                $query->whereBetween('data', [$weekStart, $weekEnd])
                    ->orderBy('data')->orderBy('horario_inicio')
                    ->with(['agenda.espaco.andar.modulo.unidade', 'avaliador']);
            },
        ])->find($reservaId);
    }

    /**
     * Returns a paginated list of Reserva visible to the given gestor agendas, with optional filters
     *
     * @param  array<int>  $agendaIds
     * @param  array<string, mixed>  $filters
     */
    public function getPaginatedForGestor(array $agendaIds, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->reserva->newQuery()
            ->select(['id', 'titulo', 'descricao', 'situacao', 'user_id', 'data_inicial', 'data_final'])
            ->whereHas('horarios', fn ($q) => $q->whereIn('agenda_id', $agendaIds))
            ->when($filters['search'] ?? null, fn ($q, $s) => $q->where(fn ($q) => $q->where('titulo', 'like', "%{$s}%")->orWhere('descricao', 'like', "%{$s}%")))
            ->when(
                $filters['situacao'] ?? null,
                fn ($q, $s) => $q->where('situacao', $s),
                fn ($q) => $q->where('situacao', '!=', 'inativa')
            )
            ->with([
                'user:id,name',
                'horarios' => function ($query) use ($agendaIds) {
                    $query->whereIn('agenda_id', $agendaIds)->limit(1)->with([
                        'agenda:id,espaco_id,turno',
                        // Issue #105: os selects são enxutos de propósito, mas cada
                        // relação aninhada precisa da própria chave estrangeira —
                        // sem andar_id/modulo_id a cadeia volta null silenciosamente.
                        'agenda.espaco:id,nome,andar_id',
                        'agenda.espaco.andar:id,nome,modulo_id',
                        'agenda.espaco.andar.modulo:id,nome',
                    ]);
                },
            ])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Returns a Reserva with horarios filtered to the gestor's agendas and the given week
     *
     * Issue #119: o whereHas escopa a própria Reserva às agendas do gestor. Sem
     * ele, filtrar apenas o relacionamento devolvia titulo/descricao/user de
     * reservas fora do escopo de gestão. Mesmo critério de getPaginatedForGestor.
     *
     * @param  array<int>  $agendaIds
     */
    public function findForGestorModal(int $reservaId, array $agendaIds, string $weekStart, string $weekEnd): ?Reserva
    {
        return $this->reserva
            ->whereHas('horarios', fn ($q) => $q->whereIn('agenda_id', $agendaIds))
            ->with([
                'user',
                'horarios' => function ($query) use ($agendaIds, $weekStart, $weekEnd) {
                    $query->whereIn('agenda_id', $agendaIds)
                        ->whereBetween('data', [$weekStart, $weekEnd])
                        ->orderBy('data')->orderBy('horario_inicio')
                        ->with([
                            'agenda' => function ($q) {
                                $q->select('id', 'espaco_id', 'turno', 'user_id')
                                    ->with('espaco.andar.modulo');
                            },
                            'avaliador',
                        ]);
                },
            ])->find($reservaId);
    }

    /**
     * Returns an instance of Reserva from the given id
     */
    public function get(int|string $id): ?Reserva
    {
        return $this->reserva->find($id);
    }

    /**
     * Updates the data of an instance of Reserva
     */
    public function update(array $data, int|string $id): Reserva
    {
        $reserva = $this->reserva->findOrFail($id);
        $reserva->update($data);

        return $reserva;
    }

    /**
     * Removes an instance of Reserva from the database
     */
    public function destroy(int|string $id): bool
    {
        return (bool) $this->reserva->findOrFail($id)->delete();
    }
}
