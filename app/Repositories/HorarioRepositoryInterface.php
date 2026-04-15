<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Horario;
use Illuminate\Database\Eloquent\Collection;

interface HorarioRepositoryInterface
{
    public function __construct(Horario $horario);

    /**
     * Stores a new instance of Horario in the database
     */
    public function store(array $data): Horario;

    /**
     * Returns all instances of Horario from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, Horario>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection;

    /**
     * Returns an instance of Horario from the given id
     */
    public function get(int|string $id): ?Horario;

    /**
     * Updates the data of an instance of Horario
     */
    public function update(array $data, int|string $id): Horario;

    /**
     * Removes an instance of Horario from the database
     */
    public function destroy(int|string $id): bool;
}
