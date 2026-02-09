<?php

namespace App\Jobs;

use App\Models\Agenda;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use App\Notifications\NotificationModel;
use Carbon\Carbon;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessarCriacaoReserva implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Propriedades para guardar os dados necessários para o Job
    protected array $dadosRequisicao;

    protected User $solicitante;

    /**
     * Tenta executar o job 3 vezes antes de falhar.
     */
    public int $tries = 3;

    /**
     * Tempo máximo em segundos que o job pode rodar.
     */
    public int $timeout = 360; // 6 minutos

    /**
     * Cria uma nova instância do Job.
     *
     * @param  array  $dadosRequisicao  Dados validados do StoreReservaRequest.
     * @param  \App\Models\User  $solicitante  O usuário que fez a solicitação.
     */
    public function __construct(array $dadosRequisicao, User $solicitante)
    {
        $this->dadosRequisicao = $dadosRequisicao;
        $this->solicitante = $solicitante;
    }

    /**
     * Executa o Job.
     * É aqui que toda a sua lógica pesada será executada em background.
     */
    public function handle(): void
    {
        try {
            $reserva = DB::transaction(function () {
                // 1. Cria a reserva principal com os dados recebidos.
                $reserva = Reserva::create([
                    'titulo' => $this->dadosRequisicao['titulo'],
                    'descricao' => $this->dadosRequisicao['descricao'],
                    'data_inicial' => $this->dadosRequisicao['data_inicial'],
                    'data_final' => $this->dadosRequisicao['data_final'],
                    'recorrencia' => $this->dadosRequisicao['recorrencia'],
                    'user_id' => $this->solicitante->id,
                    'situacao' => 'em_analise',
                ]);

                // --- LÓGICA DE CRIAÇÃO DOS HORÁRIOS (A PARTE LENTA) ---
                $horariosData = $this->dadosRequisicao['horarios_solicitados'];
                $gestores = [];
                $dataFinalReserva = Carbon::parse($reserva->data_final);

                foreach ($horariosData as $horarioInfo) {
                    $gestor = Agenda::findOrFail($horarioInfo['agenda_id'])->user;
                    $gestores[] = $gestor;
                    $dataIteracao = Carbon::parse($horarioInfo['data']);

                    while ($dataIteracao->lte($dataFinalReserva)) {
                        Horario::create([
                            'data' => $dataIteracao->toDateString(),
                            'horario_inicio' => $horarioInfo['horario_inicio'],
                            'horario_fim' => $horarioInfo['horario_fim'],
                            'agenda_id' => $horarioInfo['agenda_id'],
                            'reserva_id' => $reserva->id,
                            'situacao' => $gestor->id === $this->solicitante->id ? 'deferida' : 'em_analise',
                        ]);
                        $dataIteracao->addWeek();
                    }
                }

                // --- LÓGICA DE NOTIFICAÇÃO E ATUALIZAÇÃO DE STATUS ---
                $gestoresUnicos = collect($gestores)->unique('id');

                if ($gestoresUnicos->count() === 1 && $gestoresUnicos->first()->id === $this->solicitante->id) {
                    $reserva->update(['situacao' => 'deferida']);
                } elseif (collect($gestores)->contains(fn ($g) => $g->id === $this->solicitante->id)) {
                    $reserva->update(['situacao' => 'parcialmente_deferida']);
                }

                $partesDoNome = explode(' ', $this->solicitante->name);
                $doisPrimeirosNomes = implode(' ', array_slice($partesDoNome, 0, 2));

                foreach ($gestoresUnicos as $gestor) {
                    if ($gestor->id !== $this->solicitante->id) {
                        $gestor->notify(
                            new NotificationModel(
                                'Nova solicitação de reserva',
                                'O usuário '.$doisPrimeirosNomes.' solicitou uma reserva.',
                                route('gestor.reservas.show', ['reserva' => $reserva->id])
                            )
                        );
                    }
                }

                return $reserva;
            });
            if ($reserva) {
                ValidateReservationConflictsJob::dispatch($reserva);
            }
            // Notifica o usuário que a solicitação foi processada com SUCESSO.
            $this->solicitante->notify(
                new NotificationModel(
                    'Sua reserva foi criada!',
                    'Sua solicitação de reserva para "'.$reserva->titulo.'" foi processada com sucesso.',
                    route('reservas.show', ['reserva' => $reserva->id])
                )
            );

        } catch (Exception $e) {
            // Se algo der errado, jogue a exceção novamente para que o Laravel
            // saiba que o job falhou e possa tentar novamente mais tarde.
            Log::error('Falha no Job ProcessarCriacaoReserva: '.$e->getMessage());
            $this->fail($e); // Marca o Job como falho
        }
    }

    /**
     * Lida com a falha do job.
     * Este método é executado se o job falhar todas as tentativas.
     */
    public function failed(Throwable $exception): void
    {
        // Notifica o usuário que algo deu errado com a solicitação dele.
        $this->solicitante->notify(
            new NotificationModel(
                'Falha na sua solicitação de reserva',
                'Houve um erro ao processar sua solicitação para "'.$this->dadosRequisicao['titulo'].'". Por favor, tente novamente ou contate o suporte.',
                route('reservas.index') // Link para a página de reservas
            )
        );
    }
}
