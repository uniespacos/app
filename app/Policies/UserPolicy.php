<?php

declare(strict_types=1);

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
        return $user->hasPermissionTo('usuarios.listar');
    }

    /**
     *   Ver um usuário específico
     * - Institucional (1) e Gestor (2) podem ver qualquer usuário
     * - O próprio usuário pode ver o seu perfil
     */
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id
            || $user->hasPermissionTo('usuarios.visualizar');
    }

    /**
     *  Criar usuários
     * Apenas Institucional (1) pode criar usuários
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('usuarios.criar');
    }

    /**
     *  Atualizar usuários
     * - O próprio usuário pode atualizar o seu perfil
     */
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id
            || $user->hasPermissionTo('usuarios.atualizar');
    }

    /**
     *  Atualizar permissões de outro usuário
     */
    public function updatePermissions(User $user, User $model): bool
    {
        return $user->hasPermissionTo('usuarios.gerenciar-permissoes');
    }

    /**
     *  Deletar usuários
     * Apenas Institucional (1) pode deletar
     */
    public function delete(User $user, User $model): bool
    {
        return $user->hasPermissionTo('usuarios.deletar');
    }

    /**
     *  Restaurar usuários
     * Apenas Institucional (1) pode
     */
    public function restore(User $user, User $model): bool
    {
        return $user->hasPermissionTo('usuarios.deletar');
    }

    /**
     *  Deletar permanentemente usuários
     * Apenas Institucional (1) pode
     */
    public function forceDelete(User $user, User $model): bool
    {
        return $user->hasPermissionTo('usuarios.deletar');
    }

    /**
     *  Permissão personalizada: é Comum?
     */
    public function isComum(User $user): bool
    {
        return ! $user->hasAnyPermission(['secao.gestao-reservas', 'secao.dashboard-institucional']);
    }

    /**
     *  Permissão personalizada: é Gestor?
     */
    public function isGestor(User $user): bool
    {
        return $user->hasPermissionTo('secao.gestao-reservas');
    }

    /**
     *  Permissão personalizada: é Institucional?
     */
    public function isInstitucional(User $user): bool
    {
        return $user->hasPermissionTo('secao.dashboard-institucional');
    }
}
