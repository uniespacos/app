<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\TipoChamado;
use Illuminate\Database\Eloquent\Collection;

class TipoChamadoRepositoryEloquent implements TipoChamadoRepositoryInterface
{
    public function __construct(
        protected TipoChamado $tipoChamado,
    ) {}

    /**
     * Returns every TipoChamado in display order
     *
     * @return Collection<int, TipoChamado>
     */
    public function getList(): Collection
    {
        return $this->tipoChamado->newQuery()->ordenado()->get();
    }

    /**
     * Returns an instance of TipoChamado from the given id
     */
    public function get(int $id): ?TipoChamado
    {
        return $this->tipoChamado->find($id);
    }

    /**
     * Stores a new instance of TipoChamado in the database
     *
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): TipoChamado
    {
        return $this->tipoChamado->create($data);
    }

    /**
     * Updates the data of an instance of TipoChamado
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): TipoChamado
    {
        $tipo = $this->tipoChamado->findOrFail($id);
        $tipo->update($data);

        return $tipo;
    }

    /**
     * Soft deletes an instance of TipoChamado
     */
    public function destroy(int $id): bool
    {
        return (bool) $this->tipoChamado->findOrFail($id)->delete();
    }

    /**
     * Ids of the tipos whose chamados feed the reservation alert
     *
     * @return list<int>
     */
    public function getIdsComAlerta(): array
    {
        /** @var list<int> */
        return $this->tipoChamado->newQuery()
            ->where('exibe_alerta_espaco', true)
            ->pluck('id')
            ->all();
    }
}
