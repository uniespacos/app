<?php

declare(strict_types=1);

namespace App\Models;

use RuntimeException;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * @property bool $is_system
 */
class Role extends SpatieRole
{
    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'is_system' => 'boolean',
        ]);
    }

    public function delete(): bool
    {
        if ($this->is_system) {
            throw new RuntimeException("A role de sistema '{$this->name}' não pode ser removida.");
        }

        return parent::delete();
    }
}
