<?php

declare(strict_types=1);

namespace Tests\Feature\Console;

use App\Models\Agenda;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\Concerns\PermiteHorariosDuplicados;
use Tests\TestCase;

class CleanDuplicateHorariosCommandTest extends TestCase
{
    use DatabaseTransactions, PermiteHorariosDuplicados;

    private Reserva $reserva;

    private Agenda $agenda;

    protected function setUp(): void
    {
        parent::setUp();

        // O comando existe para remover duplicatas, entao o teste precisa
        // conseguir cria-las.
        $this->permitirHorariosDuplicados();

        $this->agenda = Agenda::factory()->create(['user_id' => User::factory()->create()->id]);
        $this->reserva = Reserva::factory()->create([
            'user_id' => User::factory()->create()->id,
            'validation_status' => 'completed',
        ]);
    }

    private function criarHorario(string $data, string $inicio = '08:00:00', string $situacao = 'em_analise'): Horario
    {
        return Horario::factory()->create([
            'reserva_id' => $this->reserva->id,
            'agenda_id' => $this->agenda->id,
            'data' => $data,
            'horario_inicio' => $inicio,
            'horario_fim' => '10:00:00',
            'situacao' => $situacao,
        ]);
    }

    private function totalDaReserva(): int
    {
        return DB::table('horarios')->where('reserva_id', $this->reserva->id)->count();
    }

    public function test_dry_run_nao_altera_nada(): void
    {
        $this->criarHorario('2026-09-01');
        $this->criarHorario('2026-09-01');
        $this->criarHorario('2026-09-01');

        $this->artisan('reservas:clean-duplicates', ['--dry-run' => true])
            ->assertSuccessful();

        $this->assertSame(3, $this->totalDaReserva());
        $this->assertSame('completed', $this->reserva->fresh()->validation_status);
    }

    public function test_remove_duplicatas_preservando_a_ocorrencia_mais_antiga(): void
    {
        $original = $this->criarHorario('2026-09-01');
        $duplicata = $this->criarHorario('2026-09-01');
        $outraData = $this->criarHorario('2026-09-08');

        $this->artisan('reservas:clean-duplicates', ['--force' => true])
            ->assertSuccessful();

        $this->assertSame(2, $this->totalDaReserva());
        $this->assertDatabaseHas('horarios', ['id' => $original->id]);
        $this->assertDatabaseHas('horarios', ['id' => $outraData->id]);
        $this->assertDatabaseMissing('horarios', ['id' => $duplicata->id]);
    }

    public function test_horarios_do_mesmo_slot_com_inicio_diferente_nao_sao_duplicata(): void
    {
        $manha = $this->criarHorario('2026-09-01', '08:00:00');
        $tarde = $this->criarHorario('2026-09-01', '14:00:00');

        $this->artisan('reservas:clean-duplicates', ['--force' => true])
            ->assertSuccessful();

        $this->assertDatabaseHas('horarios', ['id' => $manha->id]);
        $this->assertDatabaseHas('horarios', ['id' => $tarde->id]);
    }

    public function test_marca_reservas_afetadas_para_revalidacao(): void
    {
        $this->reserva->update([
            'validation_status' => 'completed',
            'conflict_cache' => ['123' => ['horario_checado_id' => 123]],
        ]);

        $this->criarHorario('2026-09-01');
        $this->criarHorario('2026-09-01');

        $this->artisan('reservas:clean-duplicates', ['--force' => true])
            ->assertSuccessful();

        $atualizada = $this->reserva->fresh();

        $this->assertSame('pending', $atualizada->validation_status);
        $this->assertNull($atualizada->conflict_cache);
    }

    public function test_reserva_sem_duplicata_nao_e_marcada_para_revalidacao(): void
    {
        $intacta = Reserva::factory()->create([
            'user_id' => User::factory()->create()->id,
            'validation_status' => 'completed',
        ]);

        Horario::factory()->create([
            'reserva_id' => $intacta->id,
            'agenda_id' => $this->agenda->id,
            'data' => '2026-09-01',
            'horario_inicio' => '08:00:00',
            'horario_fim' => '10:00:00',
        ]);

        $this->criarHorario('2026-09-02');
        $this->criarHorario('2026-09-02');

        $this->artisan('reservas:clean-duplicates', ['--force' => true])
            ->assertSuccessful();

        $this->assertSame('completed', $intacta->fresh()->validation_status);
    }

    public function test_sem_duplicatas_o_comando_sai_sem_alterar(): void
    {
        $this->criarHorario('2026-09-01');
        $this->criarHorario('2026-09-08');

        $this->artisan('reservas:clean-duplicates', ['--force' => true])
            ->expectsOutputToContain('Nenhum horário duplicado encontrado.')
            ->assertSuccessful();

        $this->assertSame(2, $this->totalDaReserva());
    }
}
