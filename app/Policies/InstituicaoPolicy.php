<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Instituicao;
use App\Models\User;

class InstituicaoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('instituicoes.listar');
    }

    public function view(User $user, Instituicao $instituicao): bool
    {
        return $user->hasPermissionTo('instituicoes.visualizar');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('instituicoes.criar');
    }

    public function update(User $user, Instituicao $instituicao): bool
    {
        return $user->hasPermissionTo('instituicoes.atualizar');
    }

    public function delete(User $user, Instituicao $instituicao): bool
    {
        return $user->hasPermissionTo('instituicoes.deletar');
    }

    public function restore(User $user, Instituicao $instituicao): bool
    {
        return false;
    }

    public function forceDelete(User $user, Instituicao $instituicao): bool
    {
        return false;
    }
}
