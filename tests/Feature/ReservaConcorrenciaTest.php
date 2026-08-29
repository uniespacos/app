<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\ProcessarCriacaoReserva;
use App\Models\Agenda;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ReservaConcorrenciaTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        Bus::fake();
        Notification::fake();
    }

    /**
     * @param  array<int, array<string, mixed>>  $slots
     * @return array<string, mixed>
     */
    private function dados(array $slots, string $titulo = 'Reserva de teste'): array
    {
        return [
            'titulo' => $titulo,
            'descricao' => 'Descricao de teste',
            'data_inicial' => '2026-09-15',
            'data_final' => '2026-09-15',
            'recorrencia' => 'unica',
            'horarios_solicitados' => $slots,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function slot(int $agendaId, string $data, string $inicio = '10:00:00', string $fim = '11:00:00'): array
    {
        return [
            'data' => $data,
            'horario_inicio' => $inicio,
            'horario_fim' => $fim,
            'agenda_id' => $agendaId,
        ];
    }

    /**
     * @param  array<string, mixed>  $dados
     */
    private function executar(array $dados, User $solicitante): ?Reserva
    {
        $job = new ProcessarCriacaoReserva($dados, $solicitante);
        app()->call([$job, 'handle']);

        return Reserva::where('titulo', $dados['titulo'])->first();
    }

    public function test_revalidacao_sob_lock_previne_double_booking(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Agenda cujo dono é user1 — seus horários nascem `deferida` automaticamente
        $agenda = Agenda::factory()->create(['user_id' => $user1->id]);

        $this->assertCount(0, Horario::all());

        // Simular: duas requisições validadas quase simultaneamente
        // (ambas veem o banco vazio, ambas passam pela validação síncrona)

        // Payload 1: user1 solicitando horário na agenda que ele administra
        $payload1 = $this->dados([
            $this->slot($agenda->id, '2026-09-15', '10:00:00', '11:00:00'),
        ], 'Reserva User1');

        // Payload 2: user2 solicitando o MESMO horário exato
        $payload2 = $this->dados([
            $this->slot($agenda->id, '2026-09-15', '10:00:00', '11:00:00'),
        ], 'Reserva User2');

        // Job 1: executa sem conflito, insere horário com `situacao = deferida`
        // (porque user1 é dono da agenda)
        $reserva1 = $this->executar($payload1, $user1);
        $this->assertNotNull($reserva1);
        $this->assertCount(1, $reserva1->horarios);
        $this->assertEquals('deferida', $reserva1->horarios->first()->situacao);

        // Job 2: revalidação sob lock detecta conflito com o horário deferida de user1
        // A transação sofre rollback, Reserva::create de user2 é desfeita
        $reserva2 = $this->executar($payload2, $user2);

        // Validações finais
        $this->assertCount(1, Horario::all(), 'Apenas 1 horário deve existir no banco');

        // Reserva de user2 não foi persistida (rollback automático da transação)
        $this->assertNull($reserva2, 'Reserva de user2 não deve ter sido criada');
        $this->assertFalse(Reserva::where('titulo', 'Reserva User2')->exists());
    }

    public function test_ausencia_de_conflito_permite_insercao_dupla_nao_sobreposta(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $agenda = Agenda::factory()->create(['user_id' => $user1->id]);

        // Slot 1: 10:00-11:00
        $payload1 = $this->dados([
            $this->slot($agenda->id, '2026-09-15', '10:00:00', '11:00:00'),
        ], 'Reserva Slot 1');

        // Slot 2: 11:00-12:00 (adjacente, sem overlap — deve ser permitido)
        $payload2 = $this->dados([
            $this->slot($agenda->id, '2026-09-15', '11:00:00', '12:00:00'),
        ], 'Reserva Slot 2');

        $reserva1 = $this->executar($payload1, $user1);
        $this->assertNotNull($reserva1);
        $this->assertCount(1, $reserva1->horarios);

        // Sem revalidação, este segundo insert falharia também
        // Com a lógica correta (`<` e `>`), adjacência é permitida
        $reserva2 = $this->executar($payload2, $user2);
        $this->assertNotNull($reserva2);
        $this->assertCount(1, $reserva2->horarios);

        // Ambos os horários devem estar no banco
        $this->assertCount(2, Horario::all());

        // Horário 1: deferida (user1 é dono)
        $horario1 = $reserva1->horarios->first();
        $this->assertEquals('10:00:00', $horario1->horario_inicio);
        $this->assertEquals('deferida', $horario1->situacao);

        // Horário 2: em_analise (user2 não é dono)
        $horario2 = $reserva2->horarios->first();
        $this->assertEquals('11:00:00', $horario2->horario_inicio);
        $this->assertEquals('em_analise', $horario2->situacao);
    }
}
