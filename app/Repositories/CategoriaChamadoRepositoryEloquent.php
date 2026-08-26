<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\CategoriaChamado;
use Illuminate\Database\Eloquent\Collection;

class CategoriaChamadoRepositoryEloquent implements CategoriaChamadoRepositoryInterface
{
    public function __construct(
        protected CategoriaChamado $categoriaChamado,
    ) {}

    /**
     * Returns every CategoriaChamado in display order
     *
     * @return Collection<int, CategoriaChamado>
     */
    public function getList(): Collection
    {
        return $this->categoriaChamado->newQuery()->ordenado()->get();
    }

    /**
     * Returns an instance of CategoriaChamado from the given id
     */
    public function get(int $id): ?CategoriaChamado
    {
        return $this->categoriaChamado->find($id);
    }

    /**
     * Stores a new instance of CategoriaChamado in the database
     *
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): CategoriaChamado
    {
        return $this->categoriaChamado->create($data);
    }

    /**
     * Updates the data of an instance of CategoriaChamado
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): CategoriaChamado
    {
        $categoria = $this->categoriaChamado->findOrFail($id);
        $categoria->update($data);

        return $categoria;
    }

    /**
     * Soft deletes an instance of CategoriaChamado
     */
    public function destroy(int $id): bool
    {
        return (bool) $this->categoriaChamado->findOrFail($id)->delete();
    }
}
