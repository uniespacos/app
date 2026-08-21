<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserRepositoryEloquent implements UserRepositoryInterface
{
    public function __construct(
        protected User $user,
    ) {}

    /**
     * Stores a new instance of User in the database
     */
    public function store(array $data): User
    {
        return $this->user->create($data);
    }

    /**
     * Returns all instances of User from the database
     *
     * @param  array<array>|null  $filters
     * @return Collection<int, User>
     */
    public function getList(array $columns = ['*'], ?array $filters = null): Collection
    {
        $query = $this->user->newQuery();

        if ($filters) {
            $query->where($filters);
        }

        return $query->get($columns);
    }

    /**
     * Returns all User records belonging to the given Instituicao with eager-loaded relations
     *
     * @return Collection<int, User>
     */
    public function getAllByInstituicao(int $instituicaoId): Collection
    {
        return $this->user
            ->whereHas('setor.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->with(['setor'])
            ->get();
    }

    /**
     * Returns all User records belonging to the given Instituicao including their agendas
     *
     * @return Collection<int, User>
     */
    public function getAllWithAgendasByInstituicao(int $instituicaoId): Collection
    {
        return $this->user
            ->whereHas('setor.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->with(['agendas', 'setor'])
            ->get();
    }

    /**
     * Returns all User records for the admin index page with full eager-loaded relations
     *
     * @return Collection<int, User>
     */
    public function getAllForAdminByInstituicao(int $instituicaoId): Collection
    {
        return $this->user
            ->whereHas('setor.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->with([
                'setor.unidade.instituicao',
                'agendas.espaco.andar.modulo.unidade.instituicao',
                // Sem isto, UserService::getIndexData() dispara 3 queries do Spatie
                // (getRoleNames/getAllPermissions/getDirectPermissions) POR usuário
                // ao montar a listagem — com a base atual (400+ usuários) isso sozinho
                // já passava de 20s e estourava o limite de execução do PHP.
                'roles.permissions',
                'permissions',
            ])
            ->get();
    }

    /**
     * Returns an instance of User from the given id
     */
    public function get(int|string $id): ?User
    {
        return $this->user->find($id);
    }

    /**
     * Updates the data of an instance of User
     */
    public function update(array $data, int|string $id): User
    {
        $user = $this->user->findOrFail($id);
        $user->update($data);

        return $user;
    }

    /**
     * Removes an instance of User from the database
     */
    public function destroy(int|string $id): bool
    {
        return (bool) $this->user->findOrFail($id)->delete();
    }
}
