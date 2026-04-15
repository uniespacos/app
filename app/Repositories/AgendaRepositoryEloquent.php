<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Agenda;
use Illuminate\Database\Eloquent\Collection;

class AgendaRepositoryEloquent implements AgendaRepositoryInterface
{
    public function __construct(
        protected Agenda $agenda,
    ) {}

    /**
     * Stores a new instance of Agenda in the database
     */
    public function store(array $data): Agenda
    {
        return $this->agenda->create($data);
    }

    /**
     * Returns all instances of Agenda from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, Agenda>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection
    {
        $query = $this->agenda->newQuery();

        if ($filters) {
            $query->where($filters);
        }

        return $query->get($columns);
    }

    /**
     * Returns Agenda records for the given ids with their user eager-loaded
     *
     * @param  array<int>  $ids
     * @return Collection<int, Agenda>
     */
    public function getWithUserByIds(array $ids): Collection
    {
        return $this->agenda->whereIn('id', $ids)->with('user')->get();
    }

    /**
     * Returns an instance of Agenda from the given id
     */
    public function get(int|string $id): ?Agenda
    {
        return $this->agenda->find($id);
    }

    /**
     * Updates the data of an instance of Agenda
     */
    public function update(array $data, int|string $id): Agenda
    {
        $agenda = $this->agenda->findOrFail($id);
        $agenda->update($data);

        return $agenda;
    }

    /**
     * Removes an instance of Agenda from the database
     */
    public function destroy(int|string $id): bool
    {
        return (bool) $this->agenda->findOrFail($id)->delete();
    }
}
