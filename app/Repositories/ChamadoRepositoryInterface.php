<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Chamado;
use Illuminate\Pagination\LengthAwarePaginator;

interface ChamadoRepositoryInterface
{
    public function __construct(Chamado $chamado);

    /**
     * Stores a new Chamado in the database
     *
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): Chamado;

    /**
     * Returns a paginated list of Chamado targeting the given Espaco ids,
     * used by the manager queue.
     *
     * @param  list<int>  $espacoIds
     * @param  array<string, mixed>  $filters
     */
    public function getPaginatedForEspacos(array $espacoIds, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Counts open Chamados for a given Espaco.
     */
    public function countAbertosParaEspaco(int $espacoId): int;

    /**
     * Counts open Chamados across a set of Espaco ids.
     *
     * @param  list<int>  $espacoIds
     */
    public function countAbertosParaEspacos(array $espacoIds): int;

    /**
     * Returns the open Chamados of an Espaco grouped by category,
     * used by the reservation alert.
     *
     * @return array<string, int> categoria => quantidade
     */
    public function categoriasAbertasParaEspaco(int $espacoId): array;

    /**
     * Returns a paginated list of open Chamados whose target Espaco has no
     * manager assigned to any of its agendas — the orphan queue.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPaginatedOrfaos(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Counts open Chamados targeting Espacos with no manager at all.
     */
    public function countOrfaos(): int;
}
