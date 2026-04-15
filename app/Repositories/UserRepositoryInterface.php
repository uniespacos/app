<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    public function __construct(User $user);

    /**
     * Stores a new instance of User in the database
     */
    public function store(array $data): User;

    /**
     * Returns all instances of User from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, User>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection;

    /**
     * Returns all User records belonging to the given Instituicao with eager-loaded relations
     *
     * @return Collection<int, User>
     */
    public function getAllByInstituicao(int $instituicaoId): Collection;

    /**
     * Returns all User records belonging to the given Instituicao including their agendas
     *
     * @return Collection<int, User>
     */
    public function getAllWithAgendasByInstituicao(int $instituicaoId): Collection;

    /**
     * Returns all User records for the admin index page with full eager-loaded relations
     *
     * @return Collection<int, User>
     */
    public function getAllForAdminByInstituicao(int $instituicaoId): Collection;

    /**
     * Returns an instance of User from the given id
     */
    public function get(int|string $id): ?User;

    /**
     * Updates the data of an instance of User
     */
    public function update(array $data, int|string $id): User;

    /**
     * Removes an instance of User from the database
     */
    public function destroy(int|string $id): bool;
}
