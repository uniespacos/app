<?php

namespace Tests\Feature;

use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ReservaSummaryTest extends TestCase
{
    use DatabaseTransactions;

    public function test_reserva_summary_groups_many_horarios_correctly()
    {
        $user = User::factory()->create();
        $espaco = Espaco::factory()->create(['nome' => 'Auditório Central']);
        $agenda = Agenda::factory()->create(['espaco_id' => $espaco->id, 'turno' => 'manha']);

        $reserva = Reserva::factory()->create(['user_id' => $user->id]);

        // Create 12 slots (more than the 10 threshold)
        // Mondays and Wednesdays for 6 weeks
        $startDate = Carbon::parse('2026-03-02'); // a Monday
        for ($i = 0; $i < 6; $i++) {
            // Monday
            Horario::create([
                'reserva_id' => $reserva->id,
                'agenda_id' => $agenda->id,
                'data' => $startDate->copy()->addWeeks($i)->format('Y-m-d'),
                'horario_inicio' => '08:00:00',
                'horario_fim' => '10:00:00',
            ]);
            // Wednesday
            Horario::create([
                'reserva_id' => $reserva->id,
                'agenda_id' => $agenda->id,
                'data' => $startDate->copy()->addWeeks($i)->addDays(2)->format('Y-m-d'),
                'horario_inicio' => '08:00:00',
                'horario_fim' => '10:00:00',
            ]);
        }

        $resumo = $reserva->resumo_horarios;

        $this->assertCount(1, $resumo);
        $this->assertTrue($resumo[0]->is_summary);
        $this->assertStringContainsString('Segunda-feira e Quarta-feira', $resumo[0]->texto);
        $this->assertStringContainsString('08:00 às 10:00', $resumo[0]->texto);
        $this->assertStringContainsString('manha', $resumo[0]->texto);
        $this->assertStringContainsString('Auditório Central', $resumo[0]->texto);
        $this->assertStringContainsString('02/03/2026 a 08/04/2026', $resumo[0]->texto);
        $this->assertStringContainsString('12 sessões', $resumo[0]->texto);
    }

    public function test_reserva_summary_lists_few_horarios_individually()
    {
        $user = User::factory()->create();
        $reserva = Reserva::factory()->create(['user_id' => $user->id]);

        // Create 2 slots (less than the 10 threshold)
        Horario::factory()->count(2)->create(['reserva_id' => $reserva->id]);

        $resumo = $reserva->resumo_horarios;

        $this->assertCount(2, $resumo);
        $this->assertFalse($resumo[0]->is_summary);
    }
}
