<?php

namespace App\Policies;

use App\Models\Instituicao;
use App\Models\User;

class InstituicaoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->permission_type_id === 1;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Instituicao $instituicao): bool
    {
        return $user->permission_type_id === 1
            && $user->setor->unidade->instituicao_id === $instituicao->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Usually creating institutions is a Super Admin action.
        // For now, let's keep it consistent with other Institutional actions.
        return $user->permission_type_id === 1;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Instituicao $instituicao): bool
    {
        return $user->permission_type_id === 1
            && $user->setor->unidade->instituicao_id === $instituicao->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Instituicao $instituicao): bool
    {
        return $user->permission_type_id === 1
            && $user->setor->unidade->instituicao_id === $instituicao->id;
    }
}
