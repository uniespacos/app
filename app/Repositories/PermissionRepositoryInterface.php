<?php

declare(strict_types=1);

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Permission;

interface PermissionRepositoryInterface
{
    /**
     * @return Collection<int, Permission>
     */
    public function all(): Collection;

    /**
     * Returns all permissions grouped by the prefix before the dot.
     *
     * @return array<string, array<int, array{id: int, name: string, group: string}>>
     */
    public function getAllGroupedByPrefix(): array;
}
