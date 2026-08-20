<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Horario;
use Illuminate\Database\Eloquent\Collection;

class HorarioRepositoryEloquent implements HorarioRepositoryInterface
{
    public function __construct(
        protected Horario $horario,
    ) {}

    /**
     * Stores a new instance of Horario in the database
     */
    public function store(array $data): Horario
    {
        return $this->horario->create($data);
    }

    /**
     * Returns all instances of Horario from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, Horario>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection
    {
        $query = $this->horario->newQuery();

        if ($filters) {
            $query->where($filters);
        }

        return $query->get($columns);
    }

    /**
     * Returns an instance of Horario from the given id
     */
    public function get(int|string $id): ?Horario
    {
        return $this->horario->find($id);
    }

    /**
     * Updates the data of an instance of Horario
     */
    public function update(array $data, int|string $id): Horario
    {
        $horario = $this->horario->findOrFail($id);
        $horario->update($data);

        return $horario;
    }

    /**
     * Removes an instance of Horario from the database
     */
    public function destroy(int|string $id): bool
    {
        return (bool) $this->horario->findOrFail($id)->delete();
    }
}
