<?php

namespace Tests\Unit\Jobs;

use App\Jobs\ProcessarCriacaoReserva;
use App\Models\Agenda;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use App\Notifications\NewReservationNotification;
use App\Notifications\ReservationCreatedNotification;
use App\Notifications\ReservationFailedNotification;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ProcessarCriacaoReservaTest extends TestCase
{
    /**
     * @test
     *
     * @group jobs
     */
    public function it_creates_reservation_and_sends_notifications(): void
    {
        // Mocking dependencies and data
        Bus::fake(); // Fake the Bus to prevent actual job dispatching
        Notification::fake(); // Fake notifications to assert they are sent
        DB::shouldReceive('transaction')->andReturnUsing(function ($callback) {
            return $callback();
        });

        // Mocking models and their creation
        $user = User::factory()->create(['id' => 11]); // The applicant
        $manager = User::factory()->create(['id' => 9]); // A manager

        $agenda = Agenda::factory()->create(['id' => 1, 'user_id' => $manager->id]);
        $horarioData = [
            [
                'agenda_id' => $agenda->id,
                'horario_inicio' => '07:30:00',
                'horario_fim' => '08:20:00',
                'data' => '2026-02-26',
            ],
        ];

        // Mocking the request data
        $dadosRequisicao = [
            'titulo' => 'Test Reservation',
            'descricao' => 'A test reservation.',
            'data_inicial' => '2026-02-26T03:00:00.000Z',
            'data_final' => '2026-02-26T03:00:00.000Z', // Single day for simplicity
            'recorrencia' => 'unica',
            'horarios' => $horarioData,
            'horarios_solicitados' => $horarioData, // Ensure this is present as per job logic
        ];

        // Mocking model creations within the job
        $mockReserva = new Reserva([
            'id' => 18,
            'titulo' => $dadosRequisicao['titulo'],
            'descricao' => $dadosRequisicao['descricao'],
            'data_inicial' => $dadosRequisicao['data_inicial'],
            'data_final' => $dadosRequisicao['data_final'],
            'recorrencia' => $dadosRequisicao['recorrencia'],
            'user_id' => $user->id,
            'situacao' => 'em_analise',
        ]);
        $mockReserva->forceFill(['created_at' => now(), 'updated_at' => now()]);

        Reserva::shouldReceive('create')->once()->andReturn($mockReserva);
        Horario::shouldReceive('create')->once();
        Agenda::shouldReceive('findOrFail')->once()->andReturn($agenda);
        $manager->shouldReceive('notify')->once()->withArgs(function ($notification) use ($mockReserva) {
            return $notification instanceof NewReservationNotification && $notification->reserva->id === $mockReserva->id;
        });
        $user->shouldReceive('notify')->once()->withArgs(function ($notification) use ($mockReserva) {
            return $notification instanceof ReservationCreatedNotification && $notification->reserva->id === $mockReserva->id;
        });

        // Instantiate and run the job
        $job = new ProcessarCriacaoReserva($dadosRequisicao, $user);
        $job->handle();

        // Assertions
        // Check if the correct notifications were sent
        Notification::assertSentTo($manager, NewReservationNotification::class);
        Notification::assertSentTo($user, ReservationCreatedNotification::class);

        // Assert that ValidateReservationConflictsJob was dispatched
        Bus::assertDispatched(function ($job) use ($mockReserva) {
            return $job instanceof \App\Jobs\ValidateReservationConflictsJob && $job->reserva->id === $mockReserva->id;
        });
    }

    /**
     * @test
     *
     * @group jobs
     */
    public function it_fails_and_notifies_user_on_exception(): void
    {
        // Mocking dependencies
        Notification::fake();
        DB::shouldReceive('transaction')->once()->andThrow(new \Exception('Database error'));

        $user = User::factory()->create(['id' => 11]);
        $dadosRequisicao = [
            'titulo' => 'Test Reservation Fail',
            'descricao' => 'A test reservation fail.',
            'data_inicial' => '2026-02-26T03:00:00.000Z',
            'data_final' => '2026-02-26T03:00:00.000Z',
            'recorrencia' => 'unica',
            'horarios' => [],
            'horarios_solicitados' => [],
        ];

        // Instantiate and run the job
        $job = new ProcessarCriacaoReserva($dadosRequisicao, $user);

        // Expecting the job to be marked as failed
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Database error');
        $job->handle();

        // Assert that ReservationFailedNotification was sent
        Notification::assertSentTo($user, ReservationFailedNotification::class, function ($notification) use ($dadosRequisicao) {
            return $notification->titulo === $dadosRequisicao['titulo'];
        });
    }

    /**
     * @test
     *
     * @group jobs
     */
    public function it_handles_single_manager_and_deferida_status(): void
    {
        // Mocking dependencies and data
        Bus::fake();
        Notification::fake();
        DB::shouldReceive('transaction')->andReturnUsing(function ($callback) {
            return $callback();
        });

        $user = User::factory()->create(['id' => 11]); // Applicant is also the sole manager
        $agenda = Agenda::factory()->create(['id' => 1, 'user_id' => $user->id]);
        $horarioData = [['agenda_id' => $agenda->id, 'horario_inicio' => '07:30:00', 'horario_fim' => '08:20:00', 'data' => '2026-02-26']];

        $dadosRequisicao = [
            'titulo' => 'Single Manager Test',
            'descricao' => '',
            'data_inicial' => '2026-02-26T03:00:00.000Z',
            'data_final' => '2026-02-26T03:00:00.000Z',
            'recorrencia' => 'unica',
            'horarios' => $horarioData,
            'horarios_solicitados' => $horarioData,
        ];

        $mockReserva = new Reserva([
            'id' => 19,
            'titulo' => $dadosRequisicao['titulo'],
            'descricao' => $dadosRequisicao['descricao'],
            'data_inicial' => $dadosRequisicao['data_inicial'],
            'data_final' => $dadosRequisicao['data_final'],
            'recorrencia' => $dadosRequisicao['recorrencia'],
            'user_id' => $user->id,
            'situacao' => 'em_analise', // Should be updated to 'deferida'
        ]);
        $mockReserva->forceFill(['created_at' => now(), 'updated_at' => now()]);

        Reserva::shouldReceive('create')->once()->andReturn($mockReserva);
        Horario::shouldReceive('create')->once();
        Agenda::shouldReceive('findOrFail')->once()->andReturn($agenda);

        // Expecting reserva to be updated to 'deferida'
        $mockReserva->shouldReceive('update')->once()->with(['situacao' => 'deferida']);

        // No NewReservationNotification should be sent to the applicant themselves
        $user->shouldNotReceive('notify')->with(NewReservationNotification::class);
        $user->shouldReceive('notify')->once()->withArgs(function ($notification) use ($mockReserva) {
            return $notification instanceof ReservationCreatedNotification && $notification->reserva->id === $mockReserva->id;
        });

        $job = new ProcessarCriacaoReserva($dadosRequisicao, $user);
        $job->handle();

        Notification::assertSentTo($user, ReservationCreatedNotification::class);
        Bus::assertDispatched(fn ($job) => $job instanceof \App\Jobs\ValidateReservationConflictsJob);
    }

    /**
     * @test
     *
     * @group jobs
     */
    public function it_handles_multiple_managers_and_partial_status(): void
    {
        // Mocking dependencies and data
        Bus::fake();
        Notification::fake();
        DB::shouldReceive('transaction')->andReturnUsing(function ($callback) {
            return $callback();
        });

        $user = User::factory()->create(['id' => 11]); // Applicant
        $manager1 = User::factory()->create(['id' => 9]); // Manager 1
        $manager2 = User::factory()->create(['id' => 10]); // Manager 2

        $agenda1 = Agenda::factory()->create(['id' => 1, 'user_id' => $manager1->id]);
        $agenda2 = Agenda::factory()->create(['id' => 2, 'user_id' => $manager2->id]);

        $horarioData = [
            ['agenda_id' => $agenda1->id, 'horario_inicio' => '07:30:00', 'horario_fim' => '08:20:00', 'data' => '2026-02-26'],
            ['agenda_id' => $agenda2->id, 'horario_inicio' => '07:30:00', 'horario_fim' => '08:20:00', 'data' => '2026-02-26'],
        ];

        $dadosRequisicao = [
            'titulo' => 'Partial Status Test',
            'descricao' => '',
            'data_inicial' => '2026-02-26T03:00:00.000Z',
            'data_final' => '2026-02-26T03:00:00.000Z',
            'recorrencia' => 'unica',
            'horarios' => $horarioData,
            'horarios_solicitados' => $horarioData,
        ];

        $mockReserva = new Reserva([
            'id' => 20,
            'titulo' => $dadosRequisicao['titulo'],
            'descricao' => $dadosRequisicao['descricao'],
            'data_inicial' => $dadosRequisicao['data_inicial'],
            'data_final' => $dadosRequisicao['data_final'],
            'recorrencia' => $dadosRequisicao['recorrencia'],
            'user_id' => $user->id,
            'situacao' => 'em_analise', // Should be updated to 'parcialmente_deferida'
        ]);
        $mockReserva->forceFill(['created_at' => now(), 'updated_at' => now()]);

        Reserva::shouldReceive('create')->once()->andReturn($mockReserva);
        Horario::shouldReceive('create')->twice();
        Agenda::shouldReceive('findOrFail')->twice()->andReturn($agenda1, $agenda2);

        // Expecting reserva to be updated to 'parcialmente_deferida'
        $mockReserva->shouldReceive('update')->once()->with(['situacao' => 'parcialmente_deferida']);

        // Expecting notifications to managers
        $manager1->shouldReceive('notify')->once()->withArgs(function ($notification) use ($mockReserva) {
            return $notification instanceof NewReservationNotification && $notification->reserva->id === $mockReserva->id;
        });
        $manager2->shouldReceive('notify')->once()->withArgs(function ($notification) use ($mockReserva) {
            return $notification instanceof NewReservationNotification && $notification->reserva->id === $mockReserva->id;
        });
        // Applicant should not be notified of NewReservationNotification
        $user->shouldNotReceive('notify')->with(NewReservationNotification::class);
        $user->shouldReceive('notify')->once()->withArgs(function ($notification) use ($mockReserva) {
            return $notification instanceof ReservationCreatedNotification && $notification->reserva->id === $mockReserva->id;
        });

        $job = new ProcessarCriacaoReserva($dadosRequisicao, $user);
        $job->handle();

        Notification::assertSentTo($manager1, NewReservationNotification::class);
        Notification::assertSentTo($manager2, NewReservationNotification::class);
        Notification::assertSentTo($user, ReservationCreatedNotification::class);
        Bus::assertDispatched(fn ($job) => $job instanceof \App\Jobs\ValidateReservationConflictsJob);
    }
}
