<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Agenda;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use App\Notifications\NewReservationNotification;
use App\Notifications\ReservationCreatedNotification;
use App\Notifications\ReservationFailedNotification;
use App\Services\ExpansaoHorariosService;
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

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Maximum number of seconds the job may run.
     */
    public int $timeout = 360;

    /**
     * @param  array<string, mixed>  $dadosRequisicao  Validated data from StoreReservaRequest.
     * @param  User  $solicitante  The user making the reservation request.
     */
    public function __construct(
        protected array $dadosRequisicao,
        protected User $solicitante,
    ) {}

    /**
     * Execute the job — creates the Reserva, generates all recurring Horario records,
     * notifies managers, and dispatches conflict validation.
     *
     * O servico e injetado aqui, e nao no construtor: o job e serializado para a
     * fila e so as propriedades do construtor viajam junto.
     */
    public function handle(ExpansaoHorariosService $expansao): void
    {
        Log::info('ProcessarCriacaoReserva started', [
            'solicitante_id' => $this->solicitante->id,
            'titulo' => $this->dadosRequisicao['titulo'],
        ]);

        try {
            $horariosData = $this->dadosRequisicao['horarios_solicitados'];

            // Uma query para todas as agendas e seus gestores, em vez de um
            // findOrFail por slot dentro do loop.
            $agendasMap = Agenda::with('user')
                ->whereIn('id', collect($horariosData)->pluck('agenda_id')->unique()->filter()->all())
                ->get()
                ->keyBy('id');

            [$reserva, $gestoresUnicos] = DB::transaction(function () use ($expansao, $agendasMap, $horariosData) {
                $reserva = Reserva::create([
                    'titulo' => $this->dadosRequisicao['titulo'],
                    'descricao' => $this->dadosRequisicao['descricao'] ?? '',
                    'data_inicial' => $this->dadosRequisicao['data_inicial'],
                    'data_final' => $this->dadosRequisicao['data_final'],
                    'recorrencia' => $this->dadosRequisicao['recorrencia'],
                    'user_id' => $this->solicitante->id,
                    'situacao' => 'em_analise',
                ]);

                [$linhas, $agendasUsadas] = $expansao->montar(
                    $horariosData,
                    $agendasMap,
                    (string) $reserva->recorrencia,
                    Carbon::parse($reserva->data_final),
                    (int) $reserva->id,
                    fn (Agenda $agenda) => $agenda->user && $agenda->user->id === $this->solicitante->id
                        ? 'deferida'
                        : 'em_analise',
                );

                if ($linhas !== []) {
                    Horario::insert($linhas);
                }

                // Agenda sem gestor atribuido nao entra na conta — antes disso
                // o acesso direto a `$gestor->id` estourava nesse caso.
                $gestoresUnicos = $agendasUsadas->map(fn (Agenda $a) => $a->user)->filter()->unique('id')->values();

                if ($gestoresUnicos->count() === 1 && $gestoresUnicos->first()->id === $this->solicitante->id) {
                    $reserva->update(['situacao' => 'deferida']);
                } elseif ($gestoresUnicos->contains(fn ($g) => $g->id === $this->solicitante->id)) {
                    $reserva->update(['situacao' => 'parcialmente_deferida']);
                }

                Log::info('Reservation created', [
                    'reserva_id' => $reserva->id,
                    'situacao' => $reserva->situacao,
                    'horarios_count' => count($linhas),
                ]);

                return [$reserva, $gestoresUnicos];
            });

            foreach ($gestoresUnicos as $gestor) {
                if ($gestor->id !== $this->solicitante->id) {
                    try {
                        $gestor->notify(new NewReservationNotification($reserva));
                    } catch (Exception $e) {
                        Log::warning("Falha ao notificar gestor {$gestor->id}: ".$e->getMessage());
                    }
                }
            }

            ValidateReservationConflictsJob::dispatch($reserva);

            Log::info('Conflict validation dispatched', ['reserva_id' => $reserva->id]);

            try {
                $this->solicitante->notify(new ReservationCreatedNotification($reserva));
            } catch (Exception $e) {
                Log::warning('Falha ao enviar notificação de sucesso: '.$e->getMessage());
            }

        } catch (Exception $e) {
            Log::error('ProcessarCriacaoReserva failed', [
                'solicitante_id' => $this->solicitante->id,
                'titulo' => $this->dadosRequisicao['titulo'],
                'error' => $e->getMessage(),
            ]);
            $this->fail($e);
        }
    }

    /**
     * Handle a job failure after all retries are exhausted.
     * Notifies the requester that their reservation could not be processed.
     */
    public function failed(Throwable $exception): void
    {
        try {
            $this->solicitante->notify(new ReservationFailedNotification(
                $this->dadosRequisicao['titulo'],
                $this->solicitante
            ));
        } catch (Exception $e) {
            Log::error('Falha fatal ao enviar notificação de erro: '.$e->getMessage());
        }
    }
}
