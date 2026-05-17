<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Setor;
use App\Models\User;

class SetorPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('setores.listar');
    }

    public function view(User $user, Setor $setor): bool
    {
        return $user->hasPermissionTo('setores.visualizar');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('setores.criar');
    }

    public function update(User $user, Setor $setor): bool
    {
        return $user->hasPermissionTo('setores.atualizar');
    }

    public function delete(User $user, Setor $setor): bool
    {
        return $user->hasPermissionTo('setores.deletar');
    }

    public function restore(User $user, Setor $setor): bool
    {
        return false;
    }

    public function forceDelete(User $user, Setor $setor): bool
    {
        return false;
    }
}
