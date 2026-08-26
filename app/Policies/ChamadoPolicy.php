<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Chamado;
use App\Models\Espaco;
use App\Models\User;
use App\Repositories\EspacoRepositoryInterface;

class ChamadoPolicy
{
    public function __construct(
        protected EspacoRepositoryInterface $repoEspaco,
    ) {}

    /**
     * Determine whether the user can view the manager queue.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('chamados.listar');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Chamado $chamado): bool
    {
        if (! $user->hasPermissionTo('chamados.listar')) {
            return false;
        }

        return $this->administraOAlvo($user, $chamado);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can triage the model.
     */
    public function update(User $user, Chamado $chamado): bool
    {
        if (! $user->hasPermissionTo('chamados.triar')) {
            return false;
        }

        return $this->administraOAlvo($user, $chamado);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Chamado $chamado): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Chamado $chamado): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Chamado $chamado): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the orphan queue.
     */
    public function viewOrfaos(User $user): bool
    {
        return $user->hasPermissionTo('secao.gestao-espacos');
    }

    private function administraOAlvo(User $user, Chamado $chamado): bool
    {
        $alvo = $chamado->reportable;

        if (! $alvo instanceof Espaco) {
            return false;
        }

        return in_array($user->id, $this->repoEspaco->getGestorIdsDoEspaco($alvo->id), true);
    }
}
