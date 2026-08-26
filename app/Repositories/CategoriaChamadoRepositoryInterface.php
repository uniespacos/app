<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\CategoriaChamado;
use Illuminate\Database\Eloquent\Collection;

interface CategoriaChamadoRepositoryInterface
{
    /**
     * Returns every CategoriaChamado in display order
     *
     * @return Collection<int, CategoriaChamado>
     */
    public function getList(): Collection;

    /**
     * Returns an instance of CategoriaChamado from the given id
     */
    public function get(int $id): ?CategoriaChamado;

    /**
     * Stores a new instance of CategoriaChamado in the database
     *
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): CategoriaChamado;

    /**
     * Updates the data of an instance of CategoriaChamado
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): CategoriaChamado;

    /**
     * Soft deletes an instance of CategoriaChamado
     */
    public function destroy(int $id): bool;
}
