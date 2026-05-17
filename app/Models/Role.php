<?php

declare(strict_types=1);

namespace App\Models;

use RuntimeException;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * @property bool $is_system
 * @property string|null $description
 */
class Role extends SpatieRole
{
    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'is_system' => 'boolean',
        ]);
    }

    protected static function booted(): void
    {
        static::updating(function (Role $role) {
            if ($role->getOriginal('is_system') === true && $role->isDirty('name')) {
                throw new RuntimeException("A role de sistema '{$role->name}' não pode ser renomeada.");
            }
        });
    }

    public function delete(): bool
    {
        if ($this->is_system) {
            throw new RuntimeException("A role de sistema '{$this->name}' não pode ser removida.");
        }

        return parent::delete();
    }
}
