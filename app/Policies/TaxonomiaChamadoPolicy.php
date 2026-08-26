<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CategoriaChamado;
use App\Models\TipoChamado;
use App\Models\User;

class TaxonomiaChamadoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('taxonomias-chamado.listar');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('taxonomias-chamado.criar');
    }

    public function update(User $user, TipoChamado|CategoriaChamado $taxonomia): bool
    {
        return $user->hasPermissionTo('taxonomias-chamado.atualizar');
    }

    public function delete(User $user, TipoChamado|CategoriaChamado $taxonomia): bool
    {
        return $user->hasPermissionTo('taxonomias-chamado.deletar');
    }

    public function restore(User $user, TipoChamado|CategoriaChamado $taxonomia): bool
    {
        return false;
    }

    public function forceDelete(User $user, TipoChamado|CategoriaChamado $taxonomia): bool
    {
        return false;
    }
}
