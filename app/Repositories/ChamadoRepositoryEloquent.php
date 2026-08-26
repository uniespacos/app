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
     * Returns a paginated list of Chamado targeting the given Espaco ids.
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
            ->when($filters['tipo_id'] ?? null, fn ($q, $tipoId) => $q->where('tipo_id', $tipoId))
            ->when($filters['categoria_id'] ?? null, fn ($q, $categoriaId) => $q->where('categoria_id', $categoriaId))
            ->with([
                'tipo',
                'categoria',
                'reportable' => fn ($q) => $q->morphWith([
                    Espaco::class => ['andar.modulo.unidade'],
                ]),
            ])
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
            ->whereHas('tipo', fn ($q) => $q->where('exibe_alerta_espaco', true))
            ->count();
    }

    /**
     * Returns a paginated list of open Chamados whose target Espaco has no manager.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPaginatedOrfaos(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->queryOrfaos()
            ->when($filters['tipo_id'] ?? null, fn ($q, $tipoId) => $q->where('tipo_id', $tipoId))
            ->when($filters['categoria_id'] ?? null, fn ($q, $categoriaId) => $q->where('categoria_id', $categoriaId))
            ->with([
                'tipo',
                'categoria',
                'reportable' => fn ($q) => $q->morphWith([
                    Espaco::class => ['andar.modulo.unidade'],
                ]),
            ])
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
     * Base query of the orphan queue.
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
     * Returns the open Chamados of an Espaco grouped by category.
     *
     * @return array<string, int> nome da categoria => quantidade
     */
    public function categoriasAbertasParaEspaco(int $espacoId): array
    {
        /** @var array<string, int> */
        return $this->chamado->newQuery()
            ->where('reportable_type', Espaco::class)
            ->where('reportable_id', $espacoId)
            ->whereIn('status', [StatusChamadoEnum::ABERTO->value, StatusChamadoEnum::EM_ANDAMENTO->value])
            ->whereHas('tipo', fn ($q) => $q->where('exibe_alerta_espaco', true))
            ->join('categorias_chamado', 'categorias_chamado.id', '=', 'chamados.categoria_id')
            ->selectRaw('categorias_chamado.nome as nome, count(*) as total')
            ->groupBy('categorias_chamado.nome')
            ->pluck('total', 'nome')
            ->all();
    }
}
