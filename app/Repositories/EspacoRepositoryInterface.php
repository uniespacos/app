<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Espaco;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;

interface EspacoRepositoryInterface
{
    public function __construct(Espaco $espaco);

    /**
     * Stores a new instance of Espaco in the database
     */
    public function store(array $data): Espaco;

    /**
     * Returns all instances of Espaco from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, Espaco>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection;

    /**
     * Returns a paginated list of Espaco for the public listing, scoped to an institution with optional filters
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPaginatedForPublic(int $instituicaoId, array $filters = [], int $perPage = 6): LengthAwarePaginator;

    /**
     * Returns all Espaco records belonging to the given Instituicao with eager-loaded relations for admin
     *
     * @return Collection<int, Espaco>
     */
    public function getAllByInstituicao(int $instituicaoId): Collection;

    /**
     * Returns distinct capacidade_pessoas values for spaces in the given institution
     *
     * @return SupportCollection<int, int>
     */
    public function getDistinctCapacidadesByInstituicao(int $instituicaoId): SupportCollection;

    /**
     * Returns the ids of the Espacos managed by a user through any of its agendas.
     *
     * @return list<int>
     */
    public function getIdsGeridosPor(int $userId): array;

    /**
     * Returns the distinct ids of the users managing an Espaco across all shifts.
     *
     * @return list<int>
     */
    public function getGestorIdsDoEspaco(int $espacoId): array;

    /**
     * Returns Espacos for QR Code sticker generation, optionally scoped by unidade/modulo.
     *
     * @return Collection<int, Espaco>
     */
    public function getParaAdesivos(?int $unidadeId = null, ?int $moduloId = null): Collection;

    /**
     * Returns an instance of Espaco from the given id
     */
    public function get(int|string $id): ?Espaco;

    /**
     * Updates the data of an instance of Espaco
     */
    public function update(array $data, int|string $id): Espaco;

    /**
     * Removes an instance of Espaco from the database
     */
    public function destroy(int|string $id): bool;
}
