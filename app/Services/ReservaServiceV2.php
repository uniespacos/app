<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\User;
use App\ReservaServiceInterface;
use Illuminate\Http\Request;
use App\Models\RegraReserva;
use Carbon\Carbon;

class ReservaServiceV2 implements ReservaServiceInterface
{
    public function getDadosToIndex(array $filters, ?string $semanaInput, int $userId): array
    {
        return [];
    }
    public function getDadosToEdit(Reserva $reserva, ?string $semanaInput): array
    {
        return [];
    }
    public function enfileirarCriacao(array $validatedData, User $solicitante): void
    {
    }
    public function enfileirarAtualizacao(Reserva $reserva, array $validatedData, User $user): void
    {

    }
}