<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Modulo;
use App\Models\User;

class ModuloPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('modulos.listar');
    }

    public function view(User $user, Modulo $modulo): bool
    {
        return $user->hasPermissionTo('modulos.visualizar');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('modulos.criar');
    }

    public function update(User $user, Modulo $modulo): bool
    {
        return $user->hasPermissionTo('modulos.atualizar');
    }

    public function delete(User $user, Modulo $modulo): bool
    {
        return $user->hasPermissionTo('modulos.deletar');
    }

    public function restore(User $user, Modulo $modulo): bool
    {
        return false;
    }

    public function forceDelete(User $user, Modulo $modulo): bool
    {
        return false;
    }
}
