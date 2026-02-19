<?php

namespace Tests\Feature;

use App\Models\Agenda;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ReservaPolicyTest extends TestCase
{
    // use DatabaseTransactions; // Removed as it is now in TestCase

    public function test_user_cannot_edit_reservation_if_partially_evaluated()
    {
        // Arrange
        $user = User::factory()->create();
        $agenda = Agenda::factory()->create();
        $reserva = Reserva::factory()->create([
            'user_id' => $user->id, 
            'situacao' => 'em_analise',
            'data_inicial' => now()->toDateString(),
            'data_final' => now()->toDateString(),
            'recorrencia' => 'unica',
        ]);
        
        // Slot 1: Evaluated (Deferida)
        Horario::factory()->create([
            'reserva_id' => $reserva->id,
            'agenda_id' => $agenda->id,
            'situacao' => 'deferida',
            'data' => now()->toDateString(),
            'horario_inicio' => '10:00:00',
            'horario_fim' => '11:00:00',
        ]);

        // Slot 2: Pending (Em analise)
        Horario::factory()->create([
            'reserva_id' => $reserva->id,
            'agenda_id' => $agenda->id,
            'situacao' => 'em_analise',
            'data' => now()->toDateString(),
            'horario_inicio' => '11:00:00',
            'horario_fim' => '12:00:00',
        ]);

        // Act & Assert
        // We need to provide minimal valid data to pass validation
        $response = $this->actingAs($user)
            ->patch(route('reservas.update', $reserva), [
                'titulo' => 'Updated Title',
                'data_inicial' => now()->toDateString(),
                'data_final' => now()->toDateString(),
                'recorrencia' => 'unica',
                'edit_scope' => 'single',
                'edited_week_date' => now()->toDateString(),
                'horarios_solicitados' => [
                    [
                        'data' => now()->toDateString(),
                        'horario_inicio' => '11:00:00',
                        'horario_fim' => '12:00:00',
                        'agenda_id' => $agenda->id,
                    ]
                ],
                // Add other required fields from StoreReservaRequest rules if any
                'descricao' => 'Updated Description', // Assuming required?
            ]);

        // We expect 403 Forbidden
        $response->assertForbidden();
    }
}
