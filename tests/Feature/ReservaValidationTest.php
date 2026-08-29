<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use Tests\TestCase;

class ReservaValidationTest extends TestCase
{
    public function test_horarios_mesmo_espaco_validation_passes_with_single_espaco(): void
    {
        $usuario = User::factory()->create();

        $espaco = Espaco::factory()->create();
        $agenda1 = Agenda::factory()->create(['espaco_id' => $espaco->id]);
        $agenda2 = Agenda::factory()->create(['espaco_id' => $espaco->id]);

        $hoje = now()->toDateString();

        $response = $this->actingAs($usuario)->post(route('reservas.store'), [
            'titulo' => 'Reserva Válida',
            'descricao' => 'Múltiplos horários no mesmo espaço',
            'data_inicial' => $hoje,
            'data_final' => $hoje,
            'recorrencia' => 'unica',
            'horarios_solicitados' => [
                [
                    'data' => $hoje,
                    'horario_inicio' => '08:00:00',
                    'horario_fim' => '10:00:00',
                    'agenda_id' => $agenda1->id,
                ],
                [
                    'data' => $hoje,
                    'horario_inicio' => '10:00:00',
                    'horario_fim' => '12:00:00',
                    'agenda_id' => $agenda2->id,
                ],
            ],
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
    }

    public function test_horarios_mesmo_espaco_validation_fails_with_multiple_espacos(): void
    {
        $usuario = User::factory()->create();

        $espaco1 = Espaco::factory()->create();
        $espaco2 = Espaco::factory()->create();
        $agenda1 = Agenda::factory()->create(['espaco_id' => $espaco1->id]);
        $agenda2 = Agenda::factory()->create(['espaco_id' => $espaco2->id]);

        $hoje = now()->toDateString();

        $response = $this->actingAs($usuario)->post(route('reservas.store'), [
            'titulo' => 'Reserva Inválida',
            'descricao' => 'Múltiplos espaços',
            'data_inicial' => $hoje,
            'data_final' => $hoje,
            'recorrencia' => 'unica',
            'horarios_solicitados' => [
                [
                    'data' => $hoje,
                    'horario_inicio' => '08:00:00',
                    'horario_fim' => '10:00:00',
                    'agenda_id' => $agenda1->id,
                ],
                [
                    'data' => $hoje,
                    'horario_inicio' => '10:00:00',
                    'horario_fim' => '12:00:00',
                    'agenda_id' => $agenda2->id,
                ],
            ],
        ]);

        $response->assertSessionHasErrors('horarios_solicitados');
        $response->assertSessionHasErrors();
    }

    public function test_horarios_mesmo_espaco_validation_passes_on_update_with_single_espaco(): void
    {
        $usuario = User::factory()->create();

        $espaco = Espaco::factory()->create();
        $agenda1 = Agenda::factory()->create(['espaco_id' => $espaco->id]);
        $agenda2 = Agenda::factory()->create(['espaco_id' => $espaco->id]);

        $reserva = $usuario->reservas()->create([
            'titulo' => 'Reserva Existente',
            'descricao' => 'Para editar',
            'data_inicial' => now()->toDateString(),
            'data_final' => now()->toDateString(),
            'recorrencia' => 'unica',
            'situacao' => 'em_analise',
        ]);

        $hoje = now()->toDateString();

        $response = $this->actingAs($usuario)->put(route('reservas.update', $reserva->id), [
            'titulo' => 'Reserva Editada',
            'descricao' => 'Múltiplos horários no mesmo espaço',
            'data_inicial' => $hoje,
            'data_final' => $hoje,
            'recorrencia' => 'unica',
            'edit_scope' => 'recurring',
            'edited_week_date' => null,
            'horarios_solicitados' => [
                [
                    'data' => $hoje,
                    'horario_inicio' => '08:00:00',
                    'horario_fim' => '10:00:00',
                    'agenda_id' => $agenda1->id,
                ],
                [
                    'data' => $hoje,
                    'horario_inicio' => '10:00:00',
                    'horario_fim' => '12:00:00',
                    'agenda_id' => $agenda2->id,
                ],
            ],
        ]);

        $response->assertSessionHasNoErrors();
    }

    public function test_horarios_mesmo_espaco_validation_fails_on_update_with_multiple_espacos(): void
    {
        $usuario = User::factory()->create();

        $espaco1 = Espaco::factory()->create();
        $espaco2 = Espaco::factory()->create();
        $agenda1 = Agenda::factory()->create(['espaco_id' => $espaco1->id]);
        $agenda2 = Agenda::factory()->create(['espaco_id' => $espaco2->id]);

        $reserva = $usuario->reservas()->create([
            'titulo' => 'Reserva Existente',
            'descricao' => 'Para editar',
            'data_inicial' => now()->toDateString(),
            'data_final' => now()->toDateString(),
            'recorrencia' => 'unica',
            'situacao' => 'em_analise',
        ]);

        $hoje = now()->toDateString();

        $response = $this->actingAs($usuario)->put(route('reservas.update', $reserva->id), [
            'titulo' => 'Reserva Editada',
            'descricao' => 'Múltiplos espaços',
            'data_inicial' => $hoje,
            'data_final' => $hoje,
            'recorrencia' => 'unica',
            'edit_scope' => 'recurring',
            'edited_week_date' => null,
            'horarios_solicitados' => [
                [
                    'data' => $hoje,
                    'horario_inicio' => '08:00:00',
                    'horario_fim' => '10:00:00',
                    'agenda_id' => $agenda1->id,
                ],
                [
                    'data' => $hoje,
                    'horario_inicio' => '10:00:00',
                    'horario_fim' => '12:00:00',
                    'agenda_id' => $agenda2->id,
                ],
            ],
        ]);

        $response->assertSessionHasErrors('horarios_solicitados');
    }

    public function test_it_rejects_past_date_in_store_request(): void
    {
        $yesterday = today()->subDay();
        $user = User::factory()->create();
        $agenda = Agenda::factory()->create();

        $response = $this->actingAs($user)->post(route('reservas.store'), [
            'titulo' => 'Teste Data Passada',
            'descricao' => '',
            'data_inicial' => $yesterday->format('Y-m-d'),
            'data_final' => $yesterday->format('Y-m-d'),
            'recorrencia' => 'unica',
            'horarios_solicitados' => [
                [
                    'agenda_id' => $agenda->id,
                    'data' => $yesterday->format('Y-m-d'),
                    'horario_inicio' => '10:00:00',
                    'horario_fim' => '11:00:00',
                ],
            ],
        ]);

        $response->assertSessionHasErrors('data_inicial');
    }

    public function test_it_rejects_data_final_before_data_inicial(): void
    {
        $tomorrow = today()->addDay();
        $today = today();
        $user = User::factory()->create();
        $agenda = Agenda::factory()->create();

        $response = $this->actingAs($user)->post(route('reservas.store'), [
            'titulo' => 'Teste Ordem Datas',
            'descricao' => '',
            'data_inicial' => $tomorrow->format('Y-m-d'),
            'data_final' => $today->format('Y-m-d'),
            'recorrencia' => 'unica',
            'horarios_solicitados' => [
                [
                    'agenda_id' => $agenda->id,
                    'data' => $tomorrow->format('Y-m-d'),
                    'horario_inicio' => '10:00:00',
                    'horario_fim' => '11:00:00',
                ],
            ],
        ]);

        $response->assertSessionHasErrors('data_final');
    }

    public function test_it_accepts_today_as_data_inicial(): void
    {
        $today = today();
        $user = User::factory()->create();
        $agenda = Agenda::factory()->create();

        $this->actingAs($user)->post(route('reservas.store'), [
            'titulo' => 'Teste Hoje',
            'descricao' => '',
            'data_inicial' => $today->format('Y-m-d'),
            'data_final' => $today->format('Y-m-d'),
            'recorrencia' => 'unica',
            'horarios_solicitados' => [
                [
                    'agenda_id' => $agenda->id,
                    'data' => $today->format('Y-m-d'),
                    'horario_inicio' => '10:00:00',
                    'horario_fim' => '11:00:00',
                ],
            ],
        ]);

        $this->assertNull(
            session('errors')?->get('data_inicial'),
            'data_inicial não deveria ser rejeitada quando é hoje'
        );
    }

    public function test_it_allows_editing_recurring_reservation_with_past_data_inicial(): void
    {
        $twoMonthsAgo = today()->subMonths(2);
        $oneMonthFromNow = today()->addMonth();
        $user = User::factory()->create();
        $agenda = Agenda::factory()->create();

        $reserva = Reserva::factory()->create([
            'user_id' => $user->id,
            'titulo' => 'Recorrente com Data Passada',
            'data_inicial' => $twoMonthsAgo,
            'data_final' => $oneMonthFromNow,
            'recorrencia' => 'personalizado',
        ]);

        Horario::factory()->create([
            'reserva_id' => $reserva->id,
            'agenda_id' => $agenda->id,
            'data' => $twoMonthsAgo->format('Y-m-d'),
            'horario_inicio' => '10:00:00',
            'horario_fim' => '11:00:00',
        ]);

        $this->actingAs($user)->put(route('reservas.update', $reserva->id), [
            'titulo' => 'Recorrente Editada',
            'descricao' => 'Descrição atualizada',
            'data_inicial' => $twoMonthsAgo->format('Y-m-d'),
            'data_final' => $oneMonthFromNow->format('Y-m-d'),
            'recorrencia' => 'personalizado',
            'edit_scope' => 'recurring',
            'edited_week_date' => null,
            'horarios_solicitados' => [
                [
                    'agenda_id' => $agenda->id,
                    'data' => $twoMonthsAgo->format('Y-m-d'),
                    'horario_inicio' => '10:00:00',
                    'horario_fim' => '11:00:00',
                ],
            ],
        ]);

        $this->assertNull(
            session('errors')?->get('data_inicial'),
            'Edição de reserva recorrente com data_inicial no passado deveria ser permitida'
        );
    }

    public function test_it_accepts_valid_reservation_creation(): void
    {
        $tomorrow = today()->addDay();
        $user = User::factory()->create();
        $agenda = Agenda::factory()->create();

        $this->actingAs($user)->post(route('reservas.store'), [
            'titulo' => 'Reserva Válida',
            'descricao' => 'Descrição',
            'data_inicial' => $tomorrow->format('Y-m-d'),
            'data_final' => $tomorrow->format('Y-m-d'),
            'recorrencia' => 'unica',
            'horarios_solicitados' => [
                [
                    'agenda_id' => $agenda->id,
                    'data' => $tomorrow->format('Y-m-d'),
                    'horario_inicio' => '10:00:00',
                    'horario_fim' => '11:00:00',
                ],
            ],
        ]);

        $this->assertNull(
            session('errors')?->get('data_inicial'),
            'Reserva com data válida deveria passar na validação de datas'
        );
    }
}
