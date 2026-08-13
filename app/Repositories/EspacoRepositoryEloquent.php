<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Agenda;
use App\Models\Espaco;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;

class EspacoRepositoryEloquent implements EspacoRepositoryInterface
{
    public function __construct(
        protected Espaco $espaco,
    ) {}

    /**
     * Stores a new instance of Espaco in the database
     */
    public function store(array $data): Espaco
    {
        return $this->espaco->create($data);
    }

    /**
     * Returns all instances of Espaco from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, Espaco>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection
    {
        $query = $this->espaco->newQuery();

        if ($filters) {
            $query->where($filters);
        }

        return $query->get($columns);
    }

    /**
     * Returns a paginated list of Espaco for the public listing, scoped to an institution with optional filters
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPaginatedForPublic(int $instituicaoId, array $filters = [], int $perPage = 6): LengthAwarePaginator
    {
        return $this->espaco->newQuery()
            ->whereHas('andar.modulo.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nome', 'like', '%'.$search.'%')
                        ->orWhereHas('andar', fn ($q) => $q->where('nome', 'like', '%'.$search.'%'))
                        ->orWhereHas('andar.modulo', fn ($q) => $q->where('nome', 'like', '%'.$search.'%'));
                });
            })
            ->when($filters['unidade'] ?? null, fn ($q, $unidade) => $q->whereHas('andar.modulo', fn ($q) => $q->where('unidade_id', $unidade)))
            ->when($filters['modulo'] ?? null, fn ($q, $modulo) => $q->whereHas('andar', fn ($q) => $q->where('modulo_id', $modulo)))
            ->when($filters['andar'] ?? null, fn ($q, $andar) => $q->where('andar_id', $andar))
            ->when($filters['capacidade'] ?? null, fn ($q, $capacidade) => $q->where('capacidade_pessoas', '>=', $capacidade))
            ->with([
                'andar:id,nome,modulo_id',
                'andar.modulo:id,nome,unidade_id',
                'andar.modulo.unidade:id,sigla',
            ])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Returns all Espaco records belonging to the given Instituicao with eager-loaded relations for admin
     *
     * @return Collection<int, Espaco>
     */
    public function getAllByInstituicao(int $instituicaoId): Collection
    {
        return $this->espaco->newQuery()
            ->whereHas('andar.modulo.unidade.instituicao', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->with(['andar.modulo.unidade.instituicao', 'agendas.user'])
            ->get();
    }

    /**
     * Returns distinct capacidade_pessoas values for spaces in the given institution
     *
     * @return SupportCollection<int, int>
     */
    public function getDistinctCapacidadesByInstituicao(int $instituicaoId): SupportCollection
    {
        return $this->espaco->newQuery()
            ->whereHas('andar.modulo.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->select('capacidade_pessoas')
            ->distinct()
            ->orderBy('capacidade_pessoas')
            ->pluck('capacidade_pessoas');
    }

    /**
     * Returns the ids of the Espacos managed by a user through any of its agendas.
     *
     * O vinculo gestor-espaco passa pela Agenda (um gestor por turno), entao
     * gerir qualquer turno significa gerir o espaco.
     *
     * @return list<int>
     */
    public function getIdsGeridosPor(int $userId): array
    {
        /** @var list<int> */
        return $this->espaco->newQuery()
            ->whereHas('agendas', fn ($q) => $q->where('user_id', $userId))
            ->pluck('id')
            ->all();
    }

    /**
     * Returns the distinct ids of the users managing an Espaco across all shifts.
     *
     * @return list<int>
     */
    public function getGestorIdsDoEspaco(int $espacoId): array
    {
        /** @var list<int> */
        return Agenda::query()
            ->where('espaco_id', $espacoId)
            ->whereNotNull('user_id')
            ->distinct()
            ->pluck('user_id')
            ->all();
    }

    /**
     * Returns Espacos for QR Code sticker generation, optionally scoped by unidade/modulo.
     *
     * @return Collection<int, Espaco>
     */
    public function getParaAdesivos(?int $unidadeId = null, ?int $moduloId = null): Collection
    {
        return $this->espaco->newQuery()
            ->with('andar.modulo.unidade')
            ->when($unidadeId, fn ($q, $unidade) => $q->whereHas('andar.modulo', fn ($sub) => $sub->where('unidade_id', $unidade)))
            ->when($moduloId, fn ($q, $modulo) => $q->whereHas('andar', fn ($sub) => $sub->where('modulo_id', $modulo)))
            ->orderBy('nome')
            ->get();
    }

    /**
     * Returns an instance of Espaco from the given id
     */
    public function get(int|string $id): ?Espaco
    {
        return $this->espaco->find($id);
    }

    /**
     * Updates the data of an instance of Espaco
     */
    public function update(array $data, int|string $id): Espaco
    {
        $espaco = $this->espaco->findOrFail($id);
        $espaco->update($data);

        return $espaco;
    }

    /**
     * Removes an instance of Espaco from the database
     */
    public function destroy(int|string $id): bool
    {
        return (bool) $this->espaco->findOrFail($id)->delete();
    }
}
