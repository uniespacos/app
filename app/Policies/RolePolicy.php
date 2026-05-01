<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('roles.listar');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('roles.visualizar');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('roles.criar');
    }

    public function update(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('roles.atualizar');
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('roles.deletar') && ! $role->is_system;
    }
}
