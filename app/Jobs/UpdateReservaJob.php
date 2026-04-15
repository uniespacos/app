<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Reserva;
use App\Models\User;
use App\Notifications\ReservationUpdatedNotification;
use App\Notifications\ReservationUpdateFailedNotification;
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

class UpdateReservaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        protected Reserva $reserva,
        protected array $validatedData,
        protected User $user,
    ) {}

    /**
     * Execute the job — updates the reservation and regenerates horarios for the given scope.
     */
    public function handle(): void
    {
        Log::info('UpdateReservaJob started', [
            'reserva_id' => $this->reserva->id,
            'user_id' => $this->user->id,
            'scope' => $this->validatedData['edit_scope'],
        ]);

        try {
            DB::transaction(function () {
                $this->reserva->update([
                    'titulo' => $this->validatedData['titulo'],
                    'descricao' => $this->validatedData['descricao'] ?? '',
                    'data_inicial' => $this->validatedData['data_inicial'],
                    'data_final' => $this->validatedData['data_final'],
                    'recorrencia' => $this->validatedData['recorrencia'],
                ]);

                $scope = $this->validatedData['edit_scope'];
                $horariosSolicitados = collect($this->validatedData['horarios_solicitados']);

                if ($scope === 'single') {
                    $dataReferencia = Carbon::parse($this->validatedData['edited_week_date']);
                    $inicioSemana = $dataReferencia->copy()->startOfWeek(Carbon::MONDAY)->toDateString();
                    $fimSemana = $dataReferencia->copy()->endOfWeek(Carbon::SUNDAY)->toDateString();

                    $horariosAtuaisNaSemana = $this->reserva->horarios()
                        ->whereBetween('data', [$inicioSemana, $fimSemana])
                        ->get();

                    $idsSolicitadosNaSemana = $horariosSolicitados->whereNotNull('id')->pluck('id');

                    foreach ($horariosAtuaisNaSemana as $horarioAtual) {
                        if (! $idsSolicitadosNaSemana->contains($horarioAtual->id)) {
                            $horarioAtual->delete();
                        }
                    }

                    foreach ($horariosSolicitados->whereNull('id') as $novoHorario) {
                        $this->reserva->horarios()->create($novoHorario);
                    }
                } else {
                    $this->reserva->horarios()->delete();

                    foreach ($horariosSolicitados as $horarioInfo) {
                        $dataIteracao = Carbon::parse($horarioInfo['data']);
                        $dataFinalReserva = Carbon::parse($this->reserva->data_final);

                        while ($dataIteracao->lte($dataFinalReserva)) {
                            $this->reserva->horarios()->create([
                                'data' => $dataIteracao->toDateString(),
                                'horario_inicio' => $horarioInfo['horario_inicio'],
                                'horario_fim' => $horarioInfo['horario_fim'],
                                'agenda_id' => $horarioInfo['agenda_id'],
                                'situacao' => 'em_analise',
                            ]);
                            $dataIteracao->addWeek();
                        }
                    }
                }
            });

            Log::info('UpdateReservaJob completed', [
                'reserva_id' => $this->reserva->id,
                'scope' => $this->validatedData['edit_scope'],
            ]);

            try {
                $this->user->notify(new ReservationUpdatedNotification($this->reserva));
            } catch (Exception $e) {
                Log::warning('Failed to send reservation update notification', [
                    'reserva_id' => $this->reserva->id,
                    'error' => $e->getMessage(),
                ]);
            }

        } catch (Exception $e) {
            Log::error('UpdateReservaJob failed', [
                'reserva_id' => $this->reserva->id,
                'user_id' => $this->user->id,
                'error' => $e->getMessage(),
            ]);
            $this->fail($e);
        }
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('UpdateReservaJob exhausted all retries', [
            'reserva_id' => $this->reserva->id,
            'user_id' => $this->user->id,
            'error' => $exception->getMessage(),
        ]);

        try {
            $this->user->notify(new ReservationUpdateFailedNotification($this->reserva, $this->user));
        } catch (Exception $e) {
            Log::error('Failed to send reservation update failure notification', [
                'reserva_id' => $this->reserva->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
