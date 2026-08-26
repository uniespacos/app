<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\TipoChamado;
use Illuminate\Database\Eloquent\Collection;

interface TipoChamadoRepositoryInterface
{
    /**
     * Returns every TipoChamado in display order
     *
     * @return Collection<int, TipoChamado>
     */
    public function getList(): Collection;

    /**
     * Returns an instance of TipoChamado from the given id
     */
    public function get(int $id): ?TipoChamado;

    /**
     * Stores a new instance of TipoChamado in the database
     *
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): TipoChamado;

    /**
     * Updates the data of an instance of TipoChamado
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): TipoChamado;

    /**
     * Soft deletes an instance of TipoChamado
     */
    public function destroy(int $id): bool;

    /**
     * Ids of the tipos whose chamados feed the reservation alert
     *
     * @return list<int>
     */
    public function getIdsComAlerta(): array;
}
