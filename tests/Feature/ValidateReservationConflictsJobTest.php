<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Events\ReservaEvent;
use App\Jobs\ValidateReservationConflictsJob;
use App\Models\Reserva;
use App\Models\User;
use App\Services\ConflictDetectionService;
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
}
