<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\SituacaoReserva\SituacaoReservaEnum;
use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
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

    #[Test]
    public function test_partial_overlap_is_rejected(): void
    {
        $usuario = User::factory()->create();
        $agenda = Agenda::factory()->create();

        // Existe horário 10:00-12:00 deferido
        Horario::create([
            'reserva_id' => Reserva::factory()->create()->id,
            'agenda_id' => $agenda->id,
            'data' => '2026-09-15',
            'horario_inicio' => '10:00:00',
            'horario_fim' => '12:00:00',
            'situacao' => SituacaoReservaEnum::DEFERIDA->value,
        ]);

        // Tentar reservar 10:30-11:30 (sobrepõe parcialmente)
        $hoje = '2026-09-15';
        $response = $this->actingAs($usuario)->post(route('reservas.store'), [
            'titulo' => 'Reserva Overlap',
            'descricao' => 'Testa overlap parcial',
            'data_inicial' => $hoje,
            'data_final' => $hoje,
            'recorrencia' => 'unica',
            'horarios_solicitados' => [
                [
                    'data' => $hoje,
                    'horario_inicio' => '10:30:00',
                    'horario_fim' => '11:30:00',
                    'agenda_id' => $agenda->id,
                ],
            ],
        ]);

        $response->assertSessionHasErrors('horarios_solicitados.0.agenda_id');
    }

    #[Test]
    public function test_enveloping_overlap_is_rejected(): void
    {
        $usuario = User::factory()->create();
        $agenda = Agenda::factory()->create();

        // Existe horário 10:00-11:00 deferido
        Horario::create([
            'reserva_id' => Reserva::factory()->create()->id,
            'agenda_id' => $agenda->id,
            'data' => '2026-09-15',
            'horario_inicio' => '10:00:00',
            'horario_fim' => '11:00:00',
            'situacao' => SituacaoReservaEnum::DEFERIDA->value,
        ]);

        // Tentar reservar 09:00-12:00 (envelopa o horário existente)
        $hoje = '2026-09-15';
        $response = $this->actingAs($usuario)->post(route('reservas.store'), [
            'titulo' => 'Reserva Envelope',
            'descricao' => 'Testa overlap por envelopamento',
            'data_inicial' => $hoje,
            'data_final' => $hoje,
            'recorrencia' => 'unica',
            'horarios_solicitados' => [
                [
                    'data' => $hoje,
                    'horario_inicio' => '09:00:00',
                    'horario_fim' => '12:00:00',
                    'agenda_id' => $agenda->id,
                ],
            ],
        ]);

        $response->assertSessionHasErrors('horarios_solicitados.0.agenda_id');
    }

    #[Test]
    public function test_adjacent_intervals_are_not_conflict(): void
    {
        $usuario = User::factory()->create();
        $agenda = Agenda::factory()->create();

        // Existe horário 10:00-11:00 deferido
        Horario::create([
            'reserva_id' => Reserva::factory()->create()->id,
            'agenda_id' => $agenda->id,
            'data' => '2026-09-15',
            'horario_inicio' => '10:00:00',
            'horario_fim' => '11:00:00',
            'situacao' => SituacaoReservaEnum::DEFERIDA->value,
        ]);

        // Tentar reservar 11:00-12:00 (adjacente, sem overlap) - deve PASSAR
        $hoje = '2026-09-15';
        $response = $this->actingAs($usuario)->post(route('reservas.store'), [
            'titulo' => 'Reserva Adjacente',
            'descricao' => 'Testa adjacência permitida',
            'data_inicial' => $hoje,
            'data_final' => $hoje,
            'recorrencia' => 'unica',
            'horarios_solicitados' => [
                [
                    'data' => $hoje,
                    'horario_inicio' => '11:00:00',
                    'horario_fim' => '12:00:00',
                    'agenda_id' => $agenda->id,
                ],
            ],
        ]);

        $response->assertSessionHasNoErrors();
    }

    #[Test]
    public function test_free_horario_is_accepted(): void
    {
        $usuario = User::factory()->create();
        $agenda = Agenda::factory()->create();

        // Nenhum horário deferido na agenda

        $hoje = now()->toDateString();
        $response = $this->actingAs($usuario)->post(route('reservas.store'), [
            'titulo' => 'Reserva Livre',
            'descricao' => 'Testa horário livre',
            'data_inicial' => $hoje,
            'data_final' => $hoje,
            'recorrencia' => 'unica',
            'horarios_solicitados' => [
                [
                    'data' => $hoje,
                    'horario_inicio' => '14:00:00',
                    'horario_fim' => '16:00:00',
                    'agenda_id' => $agenda->id,
                ],
            ],
        ]);

        $response->assertSessionHasNoErrors();
    }

    #[Test]
    public function test_editing_own_horarios_does_not_block(): void
    {
        $usuario = User::factory()->create();
        $agenda = Agenda::factory()->create(['user_id' => $usuario->id]);

        $reserva = Reserva::factory()->create([
            'user_id' => $usuario->id,
            'data_inicial' => '2026-09-15',
            'data_final' => '2026-09-15',
            'recorrencia' => 'unica',
        ]);

        // Criar horário próprio já deferido
        Horario::create([
            'reserva_id' => $reserva->id,
            'agenda_id' => $agenda->id,
            'data' => '2026-09-15',
            'horario_inicio' => '10:00:00',
            'horario_fim' => '11:00:00',
            'situacao' => SituacaoReservaEnum::DEFERIDA->value,
        ]);

        // Tentar editar (mesmo horário) - não deve bloquear
        $hoje = '2026-09-15';
        $response = $this->actingAs($usuario)->put(route('reservas.update', $reserva->id), [
            'titulo' => 'Reserva Editada',
            'descricao' => 'Edição do próprio horário',
            'data_inicial' => $hoje,
            'data_final' => $hoje,
            'recorrencia' => 'unica',
            'edit_scope' => 'recurring',
            'edited_week_date' => null,
            'horarios_solicitados' => [
                [
                    'data' => $hoje,
                    'horario_inicio' => '10:00:00',
                    'horario_fim' => '11:00:00',
                    'agenda_id' => $agenda->id,
                ],
            ],
        ]);

        $response->assertSessionHasNoErrors();
    }
}
