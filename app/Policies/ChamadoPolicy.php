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
     * Requires the listing permission and management over the target Espaco.
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
     *
     * Chamados nascem da rota publica anonima, sem usuario autenticado —
     * nunca pela area logada.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can triage the model.
     *
     * Ter a permissao nao basta: o gestor so tria chamado de espaco que
     * administra, senao qualquer gestor mexeria na fila de qualquer outro.
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
     *
     * Chamado nao e apagado: o gestor cancela, preservando o historico.
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
     *
     * Fica sob a permissao de gestao de espacos porque a acao corretiva
     * — atribuir um gestor ao espaco — e dessa secao.
     */
    public function viewOrfaos(User $user): bool
    {
        return $user->hasPermissionTo('secao.gestao-espacos');
    }

    /**
     * O vinculo gestor-espaco passa pela Agenda: administrar qualquer um dos
     * tres turnos significa administrar o espaco.
     */
    private function administraOAlvo(User $user, Chamado $chamado): bool
    {
        $alvo = $chamado->reportable;

        if (! $alvo instanceof Espaco) {
            return false;
        }

        return in_array($user->id, $this->repoEspaco->getGestorIdsDoEspaco($alvo->id), true);
    }
}
