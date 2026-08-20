<?php

declare(strict_types=1);

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Permission;

class PermissionRepositoryEloquent implements PermissionRepositoryInterface
{
    public function __construct(
        protected Permission $permission,
    ) {}

    public function all(): Collection
    {
        return $this->permission->where('guard_name', 'web')->orderBy('name')->get();
    }

    public function getAllGroupedByPrefix(): array
    {
        return $this->all()->reduce(function (array $carry, Permission $permission) {
            $group = explode('.', $permission->name)[0];

            $carry[$group][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'group' => $group,
            ];

            return $carry;
        }, []);
    }
}
