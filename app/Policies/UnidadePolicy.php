<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Unidade;
use App\Models\User;

class UnidadePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('unidades.listar');
    }

    public function view(User $user, Unidade $unidade): bool
    {
        return $user->hasPermissionTo('unidades.visualizar');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('unidades.criar');
    }

    public function update(User $user, Unidade $unidade): bool
    {
        return $user->hasPermissionTo('unidades.atualizar');
    }

    public function delete(User $user, Unidade $unidade): bool
    {
        return $user->hasPermissionTo('unidades.deletar');
    }

    public function restore(User $user, Unidade $unidade): bool
    {
        return false;
    }

    public function forceDelete(User $user, Unidade $unidade): bool
    {
        return false;
    }
}
