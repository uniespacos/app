<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Agenda;
use Illuminate\Database\Eloquent\Collection;

interface AgendaRepositoryInterface
{
    public function __construct(Agenda $agenda);

    /**
     * Stores a new instance of Agenda in the database
     */
    public function store(array $data): Agenda;

    /**
     * Returns all instances of Agenda from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, Agenda>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection;

    /**
     * Returns Agenda records for the given ids with their user eager-loaded
     *
     * @param  array<int>  $ids
     * @return Collection<int, Agenda>
     */
    public function getWithUserByIds(array $ids): Collection;

    /**
     * Returns an instance of Agenda from the given id
     */
    public function get(int|string $id): ?Agenda;

    /**
     * Updates the data of an instance of Agenda
     */
    public function update(array $data, int|string $id): Agenda;

    /**
     * Removes an instance of Agenda from the database
     */
    public function destroy(int|string $id): bool;
}
