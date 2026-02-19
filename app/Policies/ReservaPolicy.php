<?php

namespace App\Policies;

use App\Models\Reserva;
use App\Models\User;

class ReservaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Reserva $reserva): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     *
     * Esta ação agora pode ser realizada por dois atores diferentes com regras distintas:
     * 1. O USUÁRIO dono da reserva, SE a situação for 'em analise'.
     * 2. O GESTOR da agenda da reserva, a qualquer momento (para avaliar/reavaliar).
     */
    public function update(User $user, Reserva $reserva): bool
    {
        // REGRA 1: O usuário pode alterar a reserva caso ainda esteja em análise.
        if ($user->id === $reserva->user_id && $reserva->situacao === 'em_analise') {
            // Só permite edição se NENHUM slot foi avaliado ainda (todos devem ser 'em_analise')
            // Se houver qualquer slot 'deferida' ou 'indeferida', bloqueia a edição.
            $hasProcessedSlots = $reserva->horarios()
                ->whereIn('situacao', ['deferida', 'indeferida'])
                ->exists();

            if ($hasProcessedSlots) {
                return false;
            }

            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Reserva $reserva): bool
    {
        return $user->id === $reserva->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Reserva $reserva): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Reserva $reserva): bool
    {
        return false;
    }

    public function viewForGestor(User $user, Reserva $reserva): bool
    {
        // Pega os IDs de todas as agendas da reserva
        $agendasDaReservaIds = $reserva->horarios()->pluck('agenda_id')->unique();

        // Pega os IDs de todas as agendas que o gestor gerencia
        $agendasDoGestorIds = $user->agendas()->pluck('id');

        // Retorna 'true' (permitido) APENAS se houver pelo menos um item em comum
        // entre as agendas da reserva e as agendas do gestor.
        return $agendasDoGestorIds->intersect($agendasDaReservaIds)->isNotEmpty();
    }
}
