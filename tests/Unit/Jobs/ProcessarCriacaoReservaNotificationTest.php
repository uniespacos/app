<?php

namespace Tests\Unit\Jobs;

use App\Jobs\ProcessarCriacaoReserva;
use App\Models\Agenda;
use App\Models\User;
use App\Models\Setor;
use App\Notifications\NewReservationNotification;
use App\Notifications\ReservationCreatedNotification;
use App\Notifications\ReservationFailedNotification;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ProcessarCriacaoReservaNotificationTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * @group jobs
     * @group notifications
     */
    public function test_it_dispatches_notifications_correctly_when_uncommented(): void
    {
        Bus::fake();
        Notification::fake();

        $applicantUser = User::factory()->create();
        $managerUser = User::factory()->create();
        $agenda = Agenda::factory()->create(['user_id' => $managerUser->id]);

        $horarioData = [
            [
                'agenda_id' => $agenda->id,
                'horario_inicio' => '07:30:00',
                'horario_fim' => '08:20:00',
                'data' => '2026-02-26',
            ],
        ];

        $dadosRequisicao = [
            'titulo' => 'Test Reservation With Notifications',
            'descricao' => 'A test reservation with notifications enabled.',
            'data_inicial' => '2026-02-26T03:00:00.000Z',
            'data_final' => '2026-02-26T03:00:00.000Z',
            'recorrencia' => 'unica',
            'horarios' => $horarioData,
            'horarios_solicitados' => $horarioData,
        ];

        $job = new ProcessarCriacaoReserva($dadosRequisicao, $applicantUser);
        $job->handle();

        Notification::assertSentTo($managerUser, NewReservationNotification::class);
        Notification::assertSentTo($applicantUser, ReservationCreatedNotification::class);
        Bus::assertDispatched(\App\Jobs\ValidateReservationConflictsJob::class);
    }

    /**
     * @group jobs
     * @group notifications
     */
    public function test_it_correctly_dispatches_failed_notification_on_exception(): void
    {
        Notification::fake();
        $applicantUser = User::factory()->create();
        
        $dadosRequisicao = [
            'titulo' => 'Test Reservation Fail With Notifications',
        ];

        $job = new ProcessarCriacaoReserva($dadosRequisicao, $applicantUser);
        
        // Call failed directly to test the notification dispatch logic on failure
        $job->failed(new \Exception('Simulated failure'));

        Notification::assertSentTo($applicantUser, ReservationFailedNotification::class, function ($notification) use ($dadosRequisicao) {
            return $notification->reservationTitle === $dadosRequisicao['titulo'];
        });
    }
}
