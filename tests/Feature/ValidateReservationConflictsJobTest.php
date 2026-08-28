<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Events\ReservaEvent;
use App\Jobs\AvaliarReservaJob;
use App\Jobs\ValidateReservationConflictsJob;
use App\Models\Agenda;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use App\Services\ConflictDetectionService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ValidateReservationConflictsJobTest extends TestCase
{
    public function test_validate_reservation_conflicts_job_dispatches_event_on_completion(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $reserva = Reserva::factory()->create([
            'user_id' => $user->id,
            'validation_status' => 'processing',
        ]);

        $job = new ValidateReservationConflictsJob($reserva);
        $conflictService = new ConflictDetectionService;

        $job->handle($conflictService);

        Event::assertDispatched(ReservaEvent::class, function ($event) use ($reserva) {
            return $event->action === 'validated' && $event->reservaId === $reserva->id;
        });
    }

    public function test_validate_reservation_conflicts_job_updates_reservation_status_to_completed(): void
    {
        $user = User::factory()->create();
        $reserva = Reserva::factory()->create([
            'user_id' => $user->id,
            'validation_status' => 'processing',
            'conflict_cache' => null,
        ]);

        $job = new ValidateReservationConflictsJob($reserva);
        $conflictService = new ConflictDetectionService;

        $job->handle($conflictService);

        $reserva->refresh();

        $this->assertEquals('completed', $reserva->validation_status);
        $this->assertIsArray($reserva->conflict_cache);
    }

    public function test_validate_reservation_conflicts_job_implements_should_be_unique(): void
    {
        // Arrange
        Bus::fake();
        $user = User::factory()->create();
        $reserva = Reserva::factory()->create([
            'user_id' => $user->id,
            'validation_status' => 'completed',
        ]);

        // Act: Dispatch o mesmo job 2 vezes para a mesma reserva
        ValidateReservationConflictsJob::dispatch($reserva);
        ValidateReservationConflictsJob::dispatch($reserva);

        // Assert: Bus::fake() registra os dispatches
        Bus::assertDispatched(ValidateReservationConflictsJob::class);

        // Validação adicional: uniqueId() e uniqueFor() funcionam
        $job = new ValidateReservationConflictsJob($reserva);
        $this->assertInstanceOf(ShouldBeUnique::class, $job);
        $this->assertEquals("validate-conflicts-{$reserva->id}", $job->uniqueId());
        $this->assertEquals(3600, $job->uniqueFor());
    }

    public function test_validate_reservation_conflicts_job_handles_concurrent_execution_with_should_be_unique(): void
    {
        // Arrange: Simular aprovação que dispara revalidação
        Bus::fake();

        $gestor = User::factory()->create();
        $agenda = Agenda::factory()->create(['user_id' => $gestor->id]);

        $reservaA = Reserva::factory()->create(['situacao' => 'em_analise']);
        $horarioA = Horario::factory()->create([
            'reserva_id' => $reservaA->id,
            'agenda_id' => $agenda->id,
            'situacao' => 'em_analise',
            'data' => now()->addDay()->toDateString(),
            'horario_inicio' => '10:00:00',
            'horario_fim' => '11:00:00',
        ]);

        $reservaB = Reserva::factory()->create([
            'situacao' => 'em_analise',
            'validation_status' => 'completed',
        ]);
        Horario::factory()->create([
            'reserva_id' => $reservaB->id,
            'agenda_id' => $agenda->id,
            'situacao' => 'em_analise',
            'data' => $horarioA->data,
            'horario_inicio' => $horarioA->horario_inicio,
            'horario_fim' => $horarioA->horario_fim,
        ]);

        // Act: Avaliação dispara revalidação de B
        $validatedDataA1 = [
            'evaluation_scope' => 'single',
            'motivo' => null,
            'horarios_avaliados' => [['id' => $horarioA->id, 'status' => 'deferida']],
            'observacao' => null,
        ];

        $jobA = new AvaliarReservaJob($reservaA, $validatedDataA1, $gestor);
        $jobA->handle(new ConflictDetectionService);

        // Assert: ValidateReservationConflictsJob foi despachado para B
        Bus::assertDispatched(ValidateReservationConflictsJob::class, function ($job) use ($reservaB) {
            return $job->reserva->id === $reservaB->id;
        });
    }
}
