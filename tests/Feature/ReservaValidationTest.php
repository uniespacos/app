<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Agenda;
use App\Models\Espaco;
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
}
