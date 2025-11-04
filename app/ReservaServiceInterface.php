<?php

namespace App;

use App\Models\Espaco;
use App\Models\Reserva;
use App\Models\User;
use Carbon\Carbon;
use Date;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Pagination\LengthAwarePaginator;

interface ReservaServiceInterface
{
    /**
     * @param array{ search: string|null, situacao: string|null, reserva: string|null } $filters
     * @param string|null $semanaInput
     * @param int $userId
     * @return array{ reservas:LengthAwarePaginator, filters: array{search: string|null, situacao: string|null, reserva: string|null}, reservaToShow: Reserva|null, semana: array{ inicio: string, fim:string, referencia:string} }
     */
    public function getDadosToIndexGestor(array $filters, ?string $semanaInput, int $userId): array;

    /**
     * @param array{search: string|null, situacao: string|null, reserva: string|null} $filters
     * @param string|null $semanaInput
     * @param int $userId
     * @return array{ reservas:LengthAwarePaginator, filters: array{search: string|null, situacao: string|null, reserva: string|null}, reservaToShow: Reserva|null, semana: array{ inicio: string, fim:string, referencia:string} }
     */
    public function getDadosToIndexUser(array $filters, ?string $semanaInput, int $userId): array;

    /**
     * @param Reserva $reserva
     * @param string|null $semanaInput
     * @return array{espaco: Espaco, reserva: Reserva, isEditMode: boolean, semana: array{ inicio: string, fim:string, referencia:string} }
     */
    public function getDadosToEdit(Reserva $reserva, ?string $semanaInput): array;

    /**
     * @param array{titulo: string, descricao: string|null, data_inicial: string|Date, data_final: string|Date, recorrencia: string, horarios_solicitados: array } $validatedData
     * @param int $userId
     * @return void
     */
    public function enfileirarCriacao(array $validatedData, int $userId): void;

    /**
     * @param Reserva $reserva
     * @param array{titulo: string, descricao: string|null, data_inicial: string|Date, data_final: string|Date, recorrencia: string, horarios_solicitados: array } $validatedData
     * @param int $userId
     * @return void
     */
    public function enfileirarAtualizacao(Reserva $reserva, array $validatedData, int $userId): void;
    public function cancelarReserva(Reserva $reserva, int $userId, string $password): array;
    public function enfileirarAvaliacao(Reserva $reserva,array $validatedData, int $userId): void;
    public function showReservaAvaliacao(Reserva $reserva, int $userId, ?string $semanaInput): array;
}
