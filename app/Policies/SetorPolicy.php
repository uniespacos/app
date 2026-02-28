<?php

namespace App\Policies;

use App\Models\Setor;
use App\Models\User;

class SetorPolicy
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
    public function view(User $user, Setor $setor): bool
    {
        return $user->permission_type_id === 1
            && $user->setor->unidade->instituicao_id === $setor->unidade->instituicao_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->permission_type_id === 1;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Setor $setor): bool
    {
        return $user->permission_type_id === 1
            && $user->setor->unidade->instituicao_id === $setor->unidade->instituicao_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Setor $setor): bool
    {
        return $user->permission_type_id === 1
            && $user->setor->unidade->instituicao_id === $setor->unidade->instituicao_id;
    }
}
