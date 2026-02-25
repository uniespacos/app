<?php

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

    protected Reserva $reserva;

    protected array $validatedData;

    protected User $user;

    public int $tries = 3;

    /**
     * Cria uma nova instância do Job.
     */
    public function __construct(Reserva $reserva, array $validatedData, User $user)
    {
        $this->reserva = $reserva;
        $this->validatedData = $validatedData;
        $this->user = $user;
    }

    /**
     * Executa o Job.
     */
    public function handle(): void
    {
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

                    $horariosAtuaisNaSemana = $this->reserva->horarios()->whereBetween('data', [$inicioSemana, $fimSemana])->get();
                    $idsSolicitadosNaSemana = $horariosSolicitados->whereNotNull('id')->pluck('id');

                    foreach ($horariosAtuaisNaSemana as $horarioAtual) {
                        if (! $idsSolicitadosNaSemana->contains($horarioAtual->id)) {
                            $horarioAtual->delete();
                        }
                    }

                    $novosHorarios = $horariosSolicitados->whereNull('id');
                    foreach ($novosHorarios as $novoHorario) {
                        $this->reserva->horarios()->create($novoHorario);
                    }
                } else { // scope === 'recurring'
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

            // Notifica o usuário que a edição foi processada com sucesso
            try {
                $this->user->notify(new ReservationUpdatedNotification(
                    $this->reserva
                ));
            } catch (\Exception $e) {
                Log::warning("Falha ao enviar notificação de sucesso para edição da reserva {$this->reserva->id}: ".$e->getMessage());
            }

        } catch (Exception $e) {
            Log::error("Falha no Job UpdateReservaJob para reserva {$this->reserva->id}: ".$e->getMessage());
            $this->fail($e);
        }
    }

    /**
     * Lida com a falha do job.
     */
    public function failed(Throwable $exception): void
    {
        // Notifica o usuário que a edição falhou
        try {
            $this->user->notify(new ReservationUpdateFailedNotification(
                $this->reserva,
                $this->user
            ));
        } catch (\Exception $e) {
            Log::error("Falha fatal ao enviar notificação de erro para edição da reserva {$this->reserva->id}: ".$e->getMessage());
        }
    }
}
