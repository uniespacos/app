<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Andar;
use Illuminate\Database\Eloquent\Collection;

interface AndarRepositoryInterface
{
    public function __construct(Andar $andar);

    /**
     * Stores a new instance of Andar in the database
     */
    public function store(array $data): Andar;

    /**
     * Returns all instances of Andar from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, Andar>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection;

    /**
     * Returns all Andar records belonging to the given Instituicao with eager-loaded relations
     *
     * @return Collection<int, Andar>
     */
    public function getAllByInstituicao(int $instituicaoId): Collection;

    /**
     * Returns an instance of Andar from the given id
     */
    public function get(int|string $id): ?Andar;

    /**
     * Updates the data of an instance of Andar
     */
    public function update(array $data, int|string $id): Andar;

    /**
     * Removes an instance of Andar from the database
     */
    public function destroy(int|string $id): bool;
}
