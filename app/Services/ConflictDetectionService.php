<?php

namespace App\Services;

use App\Models\Reserva;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ConflictDetectionService
{
    /**
     * Encontra todos os horários conflitantes para uma dada reserva.
     * Retorna uma coleção de conflitos mapeada pelo ID do horário original.
     *
     * @param  Reserva  $reserva
     */
    public function findConflictsFor(int $reservaId): Collection
    {
        // Esta query já estava correta, esperando receber o ID ($reservaId)
        $query = "
            SELECT
                h_checar.id AS horario_checado_id,
                r_conflito.titulo AS conflito_reserva_titulo,
                u_conflito.name AS conflito_user_name
            FROM
                horarios AS h_checar
            JOIN
                horarios AS h_conflito ON
                    h_checar.reserva_id = ? AND
                    h_conflito.reserva_id != h_checar.reserva_id AND
                    h_conflito.situacao = 'deferida' AND
                    h_conflito.agenda_id = h_checar.agenda_id AND
                    h_conflito.data = h_checar.data AND
                    h_conflito.horario_inicio < h_checar.horario_fim AND
                    h_conflito.horario_fim > h_checar.horario_inicio
            JOIN reservas AS r_conflito ON r_conflito.id = h_conflito.reserva_id
            JOIN users AS u_conflito ON u_conflito.id = r_conflito.user_id
        ";

        $conflitosEncontrados = DB::select($query, [$reservaId]);

        return collect($conflitosEncontrados)->keyBy('horario_checado_id');
    }
}
