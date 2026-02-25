<?php

namespace Tests\Feature;

use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\Reserva;
use App\Models\Setor;
use App\Models\User;
use App\Notifications\ReservationCreatedNotification;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ManagerReservationNotificationTest extends TestCase
{
    use DatabaseTransactions;

    public function test_manager_does_not_receive_email_when_creating_own_reservation()
    {
        $manager = User::factory()->create();
        $espaco = Espaco::factory()->create();
        $agenda = Agenda::factory()->for($espaco)->create(['user_id' => $manager->id]);
        
        $reserva = Reserva::factory()->create(['user_id' => $manager->id]);
        $reserva->horarios()->create([
            'data' => '2026-03-01',
            'horario_inicio' => '08:00:00',
            'horario_fim' => '09:00:00',
            'agenda_id' => $agenda->id,
            'situacao' => 'deferida',
        ]);

        $notification = new ReservationCreatedNotification($reserva);
        $channels = $notification->via($manager);

        // Manager should only get internal notifications, not emails for their own reservation
        $this->assertContains('database', $channels);
        $this->assertContains('broadcast', $channels);
        $this->assertNotContains('mail', $channels, 'Manager should not receive an email for their own reservation');
    }

    public function test_normal_user_receives_email_when_creating_reservation()
    {
        $manager = User::factory()->create();
        $espaco = Espaco::factory()->create();
        $agenda = Agenda::factory()->for($espaco)->create(['user_id' => $manager->id]);

        $normalUser = User::factory()->create();
        $reserva = Reserva::factory()->create(['user_id' => $normalUser->id]);
        $reserva->horarios()->create([
            'data' => '2026-03-01',
            'horario_inicio' => '08:00:00',
            'horario_fim' => '09:00:00',
            'agenda_id' => $agenda->id,
            'situacao' => 'em_analise',
        ]);
        
        $notification = new ReservationCreatedNotification($reserva);
        $channels = $notification->via($normalUser);
        
        // Normal user should get all notifications including email
        $this->assertContains('database', $channels);
        $this->assertContains('broadcast', $channels);
        $this->assertContains('mail', $channels, 'Normal user must receive email confirmation');
    }
}
