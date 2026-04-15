<?php

declare(strict_types=1);

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
     * Allowed only for the reservation owner while the situacao is 'em_analise'
     * and no horarios have been individually evaluated yet.
     */
    public function update(User $user, Reserva $reserva): bool
    {
        if ($user->id !== $reserva->user_id || $reserva->situacao !== 'em_analise') {
            return false;
        }

        $hasProcessedSlots = $reserva->horarios()
            ->whereIn('situacao', ['deferida', 'indeferida'])
            ->exists();

        return ! $hasProcessedSlots;
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

    /**
     * Determine whether a gestor can view the reservation for evaluation.
     * Returns true only if the gestor manages at least one agenda associated with the reservation.
     */
    public function viewForGestor(User $user, Reserva $reserva): bool
    {
        $agendasDaReservaIds = $reserva->horarios()->pluck('agenda_id')->unique();
        $agendasDoGestorIds = $user->agendas()->pluck('id');

        return $agendasDoGestorIds->intersect($agendasDaReservaIds)->isNotEmpty();
    }
}
