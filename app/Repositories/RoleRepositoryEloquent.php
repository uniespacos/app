<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Role;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class RoleRepositoryEloquent implements RoleRepositoryInterface
{
    public function __construct(
        protected Role $role,
    ) {}

    public function all(): Collection
    {
        return $this->role->all();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->role->paginate($perPage);
    }

    public function getAllWithCounts(): Collection
    {
        return $this->role
            ->withCount('users', 'permissions')
            ->with('permissions:id,name')
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();
    }

    public function find(int $id): ?Role
    {
        return $this->role->find($id);
    }

    public function create(array $data): Role
    {
        /** @var Role $role */
        $role = $this->role->create($data);

        return $role;
    }

    public function update(Role $role, array $data): bool
    {
        return $role->update($data);
    }

    public function delete(Role $role): bool
    {
        return $role->delete();
    }
}
