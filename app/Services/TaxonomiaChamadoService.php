<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CategoriaChamado;
use App\Models\TipoChamado;
use App\Repositories\CategoriaChamadoRepositoryInterface;
use App\Repositories\TipoChamadoRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TaxonomiaChamadoService
{
    public function __construct(
        protected TipoChamadoRepositoryInterface $repoTipo,
        protected CategoriaChamadoRepositoryInterface $repoCategoria,
    ) {}

    /**
     * @return Collection<int, TipoChamado>
     */
    public function getTipos(): Collection
    {
        return $this->repoTipo->getList();
    }

    /**
     * @return Collection<int, CategoriaChamado>
     */
    public function getCategorias(): Collection
    {
        return $this->repoCategoria->getList();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function storeTipo(array $data): TipoChamado
    {
        return $this->repoTipo->store($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateTipo(TipoChamado $tipo, array $data): TipoChamado
    {
        return $this->repoTipo->update($tipo->id, $data);
    }

    public function deleteTipo(TipoChamado $tipo): bool
    {
        return $this->repoTipo->destroy($tipo->id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function storeCategoria(array $data): CategoriaChamado
    {
        return $this->repoCategoria->store($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateCategoria(CategoriaChamado $categoria, array $data): CategoriaChamado
    {
        return $this->repoCategoria->update($categoria->id, $data);
    }

    public function deleteCategoria(CategoriaChamado $categoria): bool
    {
        return $this->repoCategoria->destroy($categoria->id);
    }
}
