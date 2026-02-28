<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Ver qualquer lista de usuários
     * Permite se for Institucional (1) ou Gestor (2)
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->permission_type_id, [1, 2]);
    }

    /**
     *   Ver um usuário específico
     * - Institucional (1) e Gestor (2) podem ver qualquer usuário da mesma instituição
     * - O próprio usuário pode ver o seu perfil
     */
    public function view(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return true;
        }

        if (in_array($user->permission_type_id, [1, 2])) {
            return $user->setor->unidade->instituicao_id === $model->setor->unidade->instituicao_id;
        }

        return false;
    }

    /**
     *  Criar usuários
     * Apenas Institucional (1) pode criar usuários
     */
    public function create(User $user): bool
    {
        return $user->permission_type_id === 1;
    }

    /**
     *  Atualizar usuários
     * - O próprio usuário pode atualizar o seu perfil
     * - Institucional (1) e Gestor (2) podem atualizar usuários da mesma instituição
     */
    public function update(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return true;
        }

        if (in_array($user->permission_type_id, [1, 2])) {
            return $user->setor->unidade->instituicao_id === $model->setor->unidade->instituicao_id;
        }

        return false;
    }

    /**
     *  Deletar usuários
     * Apenas Institucional (1) pode deletar usuários da mesma instituição
     */
    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false; // Não permitir auto-exclusão por segurança
        }

        if ($user->permission_type_id === 1) {
            return $user->setor->unidade->instituicao_id === $model->setor->unidade->instituicao_id;
        }

        return false;
    }

    /**
     *  Restaurar usuários
     * Apenas Institucional (1) pode
     */
    public function restore(User $user, User $model): bool
    {
        return $user->permission_type_id === 1 
            && $user->setor->unidade->instituicao_id === $model->setor->unidade->instituicao_id;
    }

    /**
     *  Deletar permanentemente usuários
     * Apenas Institucional (1) pode
     */
    public function forceDelete(User $user, User $model): bool
    {
        return $user->permission_type_id === 1
            && $user->setor->unidade->instituicao_id === $model->setor->unidade->instituicao_id;
    }

    /**
     *  Permissão personalizada: é Comum?
     */
    public function isComum(User $user): bool
    {
        return $user->permission_type_id === 3;
    }

    /**
     *  Permissão personalizada: é Gestor?
     */
    public function isGestor(User $user): bool
    {
        return $user->permission_type_id === 2;
    }

    /**
     *  Permissão personalizada: é Institucional?
     */
    public function isInstitucional(User $user): bool
    {
        return $user->permission_type_id === 1;
    }
}
