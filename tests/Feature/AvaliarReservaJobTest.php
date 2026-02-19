<?php

namespace Tests\Feature;

use App\Jobs\AvaliarReservaJob;
use App\Models\Agenda;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use App\Services\ConflictDetectionService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AvaliarReservaJobTest extends TestCase
{
    // use DatabaseTransactions; // Removed as it is now in TestCase

    public function test_avaliar_reserva_job_handles_solicitado_status()
    {
        // Arrange
        $manager = User::factory()->create();
        $agenda = Agenda::factory()->create(['user_id' => $manager->id]); // Manager owns agenda
        $reserva = Reserva::factory()->create(['user_id' => $manager->id]);

        $horario = Horario::factory()->create([
            'reserva_id' => $reserva->id,
            'agenda_id' => $agenda->id,
            'situacao' => 'em_analise',
            'data' => now()->addDay()->toDateString(),
            'horario_inicio' => '10:00:00',
            'horario_fim' => '11:00:00',
        ]);

        $validatedData = [
            'evaluation_scope' => 'single',
            'motivo' => null,
            'horarios_avaliados' => [
                [
                    'id' => $horario->id,
                    'status' => 'solicitado', // This is the problematic status from frontend
                ],
            ],
            'observacao' => 'Test observation',
        ];

        $job = new AvaliarReservaJob($reserva, $validatedData, $manager);
        $conflictService = new ConflictDetectionService;

        // Act
        try {
            $job->handle($conflictService);
        } catch (\Exception $e) {
            $this->fail('Job failed with exception: '.$e->getMessage());
        }

        // Assert
        $this->assertDatabaseHas('horarios', [
            'id' => $horario->id,
            'situacao' => 'em_analise', // Correctly mapped from 'solicitado'
        ]);
    }

    public function test_reservation_status_aggregation_remains_em_analise_if_slots_pending()
    {
        // Arrange
        $manager = User::factory()->create();
        $agenda = Agenda::factory()->create(['user_id' => $manager->id]);
        $reserva = Reserva::factory()->create(['situacao' => 'em_analise']);

        $horario1 = Horario::factory()->create([
            'reserva_id' => $reserva->id,
            'agenda_id' => $agenda->id,
            'situacao' => 'em_analise',
            'data' => now()->addDay()->toDateString(),
        ]);

        $horario2 = Horario::factory()->create([
            'reserva_id' => $reserva->id,
            'agenda_id' => $agenda->id,
            'situacao' => 'em_analise',
            'data' => now()->addDays(2)->toDateString(),
        ]);

        // Act: Approve only one slot
        $validatedData = [
            'evaluation_scope' => 'single',
            'motivo' => null,
            'horarios_avaliados' => [
                [
                    'id' => $horario1->id,
                    'status' => 'deferida',
                ],
            ],
            'observacao' => 'Test observation',
        ];

        $job = new AvaliarReservaJob($reserva, $validatedData, $manager);
        $job->handle(new ConflictDetectionService);

        // Assert
        $reserva->refresh();
        // It should be 'em_analise' because $horario2 is still 'em_analise'
        // Before the fix, it would have been 'parcialmente_deferida'
        $this->assertEquals('em_analise', $reserva->situacao);
    }

    public function test_reservation_status_aggregation_becomes_parcialmente_deferida_when_all_assessed()
    {
        // Arrange
        $manager = User::factory()->create();
        $agenda = Agenda::factory()->create(['user_id' => $manager->id]);
        $reserva = Reserva::factory()->create(['situacao' => 'em_analise']);

        $horario1 = Horario::factory()->create(['reserva_id' => $reserva->id, 'agenda_id' => $agenda->id, 'situacao' => 'em_analise']);
        $horario2 = Horario::factory()->create(['reserva_id' => $reserva->id, 'agenda_id' => $agenda->id, 'situacao' => 'em_analise']);

        // Act: Approve one, Reject another
        $validatedData = [
            'evaluation_scope' => 'single',
            'motivo' => 'Rejection reason',
            'horarios_avaliados' => [
                [
                    'id' => $horario1->id,
                    'status' => 'deferida',
                ],
                [
                    'id' => $horario2->id,
                    'status' => 'indeferida',
                ],
            ],
            'observacao' => 'Test observation',
        ];

        $job = new AvaliarReservaJob($reserva, $validatedData, $manager);
        $job->handle(new ConflictDetectionService);

        // Assert
        $reserva->refresh();
        $this->assertEquals('parcialmente_deferida', $reserva->situacao);
    }
}
