<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Andar;
use Illuminate\Database\Eloquent\Collection;

class AndarRepositoryEloquent implements AndarRepositoryInterface
{
    public function __construct(
        protected Andar $andar,
    ) {}

    /**
     * Stores a new instance of Andar in the database
     */
    public function store(array $data): Andar
    {
        return $this->andar->create($data);
    }

    /**
     * Returns all instances of Andar from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, Andar>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection
    {
        $query = $this->andar->newQuery();

        if ($filters) {
            $query->where($filters);
        }

        return $query->get($columns);
    }

    /**
     * Returns all Andar records belonging to the given Instituicao with eager-loaded relations
     *
     * @return Collection<int, Andar>
     */
    public function getAllByInstituicao(int $instituicaoId): Collection
    {
        return $this->andar
            ->whereHas('modulo.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->with(['modulo', 'espacos'])
            ->get();
    }

    /**
     * Returns an instance of Andar from the given id
     */
    public function get(int|string $id): ?Andar
    {
        return $this->andar->find($id);
    }

    /**
     * Updates the data of an instance of Andar
     */
    public function update(array $data, int|string $id): Andar
    {
        $andar = $this->andar->findOrFail($id);
        $andar->update($data);

        return $andar;
    }

    /**
     * Removes an instance of Andar from the database
     */
    public function destroy(int|string $id): bool
    {
        return (bool) $this->andar->findOrFail($id)->delete();
    }
}
