<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\SituacaoReserva\SituacaoReservaEnum;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use App\Notifications\ReservationEvaluatedNotification;
use App\Services\ConflictDetectionService;
use Carbon\Carbon;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class AvaliarReservaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        protected Reserva $reserva,
        protected array $validatedData,
        protected User $gestor,
    ) {}

    /**
     * Execute the job — evaluates each horario based on the gestor's decisions and conflict state.
     */
    public function handle(ConflictDetectionService $conflictService): void
    {
        Log::info('AvaliarReservaJob started', [
            'reserva_id' => $this->reserva->id,
            'gestor_id' => $this->gestor->id,
            'scope' => $this->validatedData['evaluation_scope'],
            'horarios_count' => count($this->validatedData['horarios_avaliados']),
        ]);

        if ($this->reserva->situacao === SituacaoReservaEnum::INATIVA->value) {
            throw new Exception('Cannot evaluate an archived reservation.');
        }

        try {
            DB::transaction(function () use ($conflictService) {
                $scope = $this->validatedData['evaluation_scope'];
                $agendasDoGestorIds = $this->gestor->agendas()->pluck('id');
                $motivoDoGestor = $this->validatedData['motivo'] ?? null;
                $horariosDaAvaliacao = collect($this->validatedData['horarios_avaliados']);

                $conflitosMap = $conflictService->findConflictsFor($this->reserva->id);
                $horariosConflitantesIds = $conflitosMap->keys();

                if ($scope === 'single') {
                    foreach ($horariosDaAvaliacao as $avaliacao) {
                        $horarioId = $avaliacao['id'];
                        $statusFinal = $avaliacao['status'] === 'solicitado' ? 'em_analise' : $avaliacao['status'];
                        $justificativaFinal = $motivoDoGestor;

                        if ($horariosConflitantesIds->contains($horarioId)) {
                            $conflito = $conflitosMap->get($horarioId);
                            $statusFinal = 'indeferida';
                            $justificativaFinal = "Conflito com a reserva '{$conflito->conflito_reserva_titulo}' de {$conflito->conflito_user_name}.";
                        }

                        Horario::where('id', $horarioId)
                            ->whereIn('agenda_id', $agendasDoGestorIds)
                            ->update([
                                'situacao' => $statusFinal,
                                'user_id' => $this->gestor->id,
                                'justificativa' => $justificativaFinal,
                            ]);
                    }
                } else {
                    if ($horariosConflitantesIds->isNotEmpty()) {
                        foreach ($horariosConflitantesIds as $id) {
                            $conflito = $conflitosMap->get($id);
                            $justificativa = $conflito
                                ? "Conflito com a reserva '{$conflito->conflito_reserva_titulo}' de {$conflito->conflito_user_name}."
                                : 'Conflito com outra reserva.';

                            Horario::where('id', $id)->update([
                                'situacao' => 'indeferida',
                                'justificativa' => $justificativa,
                                'user_id' => $this->gestor->id,
                            ]);
                        }
                    }

                    $processedPatterns = [];
                    foreach ($horariosDaAvaliacao as $avaliacao) {
                        $horarioId = $avaliacao['id'];

                        if ($horariosConflitantesIds->contains($horarioId)) {
                            continue;
                        }

                        $horarioFonte = $this->reserva->horarios()->find($horarioId);
                        if (! $horarioFonte) {
                            continue;
                        }

                        $dayOfWeek = Carbon::parse($horarioFonte->data)->dayOfWeek;
                        $pattern = "{$horarioFonte->agenda_id}-{$horarioFonte->horario_inicio}-{$dayOfWeek}";

                        if (in_array($pattern, $processedPatterns)) {
                            continue;
                        }

                        $statusParaReplicar = $avaliacao['status'] === 'solicitado' ? 'em_analise' : $avaliacao['status'];
                        $justificativaParaReplicar = $statusParaReplicar === 'indeferida' ? $motivoDoGestor : null;

                        $this->reserva->horarios()
                            ->whereNotIn('id', $horariosConflitantesIds)
                            ->whereIn('agenda_id', $agendasDoGestorIds)
                            ->where('horario_inicio', $horarioFonte->horario_inicio)
                            ->whereRaw('EXTRACT(DOW FROM data) = ?', [$dayOfWeek])
                            ->update([
                                'situacao' => $statusParaReplicar,
                                'user_id' => $this->gestor->id,
                                'justificativa' => $justificativaParaReplicar,
                            ]);

                        $processedPatterns[] = $pattern;
                    }
                }

                $this->reserva->observacao = $this->validatedData['observacao'] ?? $this->reserva->observacao;
                $this->updateReservaOverallStatus($this->reserva);
            });

            $this->reserva->refresh();

            Log::info('AvaliarReservaJob completed', [
                'reserva_id' => $this->reserva->id,
                'situacao' => $this->reserva->situacao,
            ]);

            $recentlyApprovedIds = collect($this->validatedData['horarios_avaliados'])
                ->where('status', 'deferida')
                ->pluck('id');

            $horariosRecemAprovados = $this->reserva->horarios()
                ->where('situacao', 'deferida')
                ->whereIn('id', $recentlyApprovedIds)
                ->get();

            if ($horariosRecemAprovados->isNotEmpty()) {
                $this->triggerConflictRevalidation($horariosRecemAprovados);
            }

            try {
                $this->reserva->user->notify(new ReservationEvaluatedNotification(
                    $this->reserva,
                    $this->reserva->situacao_formatada,
                    $this->gestor
                ));
            } catch (Exception $e) {
                Log::warning('Falha ao enviar notificação de avaliação da reserva', [
                    'reserva_id' => $this->reserva->id,
                    'exception' => $e,
                ]);
            }

        } catch (Exception $e) {
            Log::error('AvaliarReservaJob failed', [
                'reserva_id' => $this->reserva->id,
                'gestor_id' => $this->gestor->id,
                'exception' => $e,
            ]);
            $this->fail($e);
        }
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('AvaliarReservaJob exhausted all retries', [
            'reserva_id' => $this->reserva->id,
            'gestor_id' => $this->gestor->id,
            'exception' => $exception,
        ]);
    }

    /**
     * Dispatches conflict revalidation jobs for other pending reservations
     * that share a slot with any of the newly approved horarios.
     *
     * @param  Collection<int, Horario>  $horariosAprovados
     */
    private function triggerConflictRevalidation(Collection $horariosAprovados): void
    {
        $slotsOcupados = $horariosAprovados
            ->map(fn ($h) => ['data' => $h->data, 'agenda_id' => $h->agenda_id])
            ->unique(fn ($item) => $item['data'].$item['agenda_id']);

        if ($slotsOcupados->isEmpty()) {
            return;
        }

        $reservasParaRevalidar = Reserva::query()
            ->where('id', '!=', $this->reserva->id)
            ->where('validation_status', 'completed')
            ->where('situacao', 'em_analise')
            ->whereHas('horarios', function ($query) use ($slotsOcupados) {
                $query->where(function ($q) use ($slotsOcupados) {
                    foreach ($slotsOcupados as $slot) {
                        $q->orWhere(function ($orQ) use ($slot) {
                            $orQ->where('data', $slot['data'])->where('agenda_id', $slot['agenda_id']);
                        });
                    }
                });
            })
            ->select('id')
            ->get();

        foreach ($reservasParaRevalidar as $reserva) {
            Log::info('Disparando revalidação de conflito por aprovação de reserva', [
                'reserva_id' => $reserva->id,
                'reserva_aprovada_id' => $this->reserva->id,
            ]);
            ValidateReservationConflictsJob::dispatch($reserva);
        }
    }

    /**
     * Recalculates and persists the overall situacao of the reservation
     * based on the aggregate statuses of its horarios.
     */
    private function updateReservaOverallStatus(Reserva $reserva): void
    {
        if ($reserva->situacao === SituacaoReservaEnum::INATIVA->value) {
            return;
        }

        $statusCounts = DB::table('horarios')
            ->where('reserva_id', $reserva->id)
            ->select('situacao', DB::raw('count(*) as total'))
            ->groupBy('situacao')
            ->pluck('total', 'situacao');

        $totalHorarios = $statusCounts->sum();

        if ($totalHorarios === 0) {
            $reserva->situacao = 'indeferida';
            $reserva->save();

            return;
        }

        $deferidosCount = $statusCounts->get('deferida', 0);
        $indeferidosCount = $statusCounts->get('indeferida', 0);
        $emAnaliseCount = $statusCounts->get('em_analise', 0);

        $novaSituacao = match (true) {
            $deferidosCount === $totalHorarios => 'deferida',
            $indeferidosCount === $totalHorarios => 'indeferida',
            $emAnaliseCount > 0 => 'em_analise',
            default => 'parcialmente_deferida',
        };

        $reserva->situacao = $novaSituacao;
        $reserva->save();
    }
}
