<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Enums\Chamado\StatusChamadoEnum;
use App\Models\Chamado;
use App\Models\Espaco;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class ChamadoRepositoryEloquent implements ChamadoRepositoryInterface
{
    public function __construct(
        protected Chamado $chamado,
    ) {}

    /**
     * Stores a new Chamado in the database
     *
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): Chamado
    {
        return $this->chamado->create($data);
    }

    /**
     * Returns a paginated list of Chamado targeting the given Espaco ids,
     * used by the manager queue.
     *
     * @param  list<int>  $espacoIds
     * @param  array<string, mixed>  $filters
     */
    public function getPaginatedForEspacos(array $espacoIds, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->chamado->newQuery()
            ->where('reportable_type', Espaco::class)
            ->whereIn('reportable_id', $espacoIds)
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['categoria'] ?? null, fn ($q, $categoria) => $q->where('categoria', $categoria))
            ->with([
                'reportable' => fn ($q) => $q->morphWith([
                    Espaco::class => ['andar.modulo.unidade'],
                ]),
            ])
            // Desempate por id: varios chamados podem cair no mesmo segundo,
            // e sem isso a ordem da pagina fica indefinida.
            ->latest()
            ->latest('id')
            ->paginate($perPage);
    }

    /**
     * Counts open Chamados for a given Espaco.
     */
    public function countAbertosParaEspaco(int $espacoId): int
    {
        return $this->countAbertosParaEspacos([$espacoId]);
    }

    /**
     * Counts open Chamados across a set of Espaco ids.
     *
     * @param  list<int>  $espacoIds
     */
    public function countAbertosParaEspacos(array $espacoIds): int
    {
        return $this->chamado->newQuery()
            ->where('reportable_type', Espaco::class)
            ->whereIn('reportable_id', $espacoIds)
            ->whereIn('status', [StatusChamadoEnum::ABERTO->value, StatusChamadoEnum::EM_ANDAMENTO->value])
            ->count();
    }

    /**
     * Returns a paginated list of open Chamados whose target Espaco has no
     * manager assigned to any of its agendas — the orphan queue.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPaginatedOrfaos(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->queryOrfaos()
            ->when($filters['categoria'] ?? null, fn ($q, $categoria) => $q->where('categoria', $categoria))
            ->with([
                'reportable' => fn ($q) => $q->morphWith([
                    Espaco::class => ['andar.modulo.unidade'],
                ]),
            ])
            // Desempate por id: varios chamados podem cair no mesmo segundo,
            // e sem isso a ordem da pagina fica indefinida.
            ->latest()
            ->latest('id')
            ->paginate($perPage);
    }

    /**
     * Counts open Chamados targeting Espacos with no manager at all.
     */
    public function countOrfaos(): int
    {
        return $this->queryOrfaos()->count();
    }

    /**
     * Base query of the orphan queue: chamados em aberto cujo Espaco alvo
     * nao tem gestor em nenhuma das agendas.
     *
     * @return Builder<Chamado>
     */
    private function queryOrfaos(): Builder
    {
        return $this->chamado->newQuery()
            ->where('reportable_type', Espaco::class)
            ->whereIn('status', [StatusChamadoEnum::ABERTO->value, StatusChamadoEnum::EM_ANDAMENTO->value])
            ->whereIn('reportable_id', Espaco::query()
                ->whereDoesntHave('agendas', fn ($q) => $q->whereNotNull('user_id'))
                ->select('id'));
    }

    /**
     * Returns the open Chamados of an Espaco grouped by category,
     * used by the reservation alert.
     *
     * @return array<string, int> categoria => quantidade
     */
    public function categoriasAbertasParaEspaco(int $espacoId): array
    {
        /** @var array<string, int> */
        return $this->chamado->newQuery()
            ->where('reportable_type', Espaco::class)
            ->where('reportable_id', $espacoId)
            ->whereIn('status', [StatusChamadoEnum::ABERTO->value, StatusChamadoEnum::EM_ANDAMENTO->value])
            ->selectRaw('categoria, count(*) as total')
            ->groupBy('categoria')
            ->pluck('total', 'categoria')
            ->all();
    }
}
