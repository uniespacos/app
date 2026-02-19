<?php

namespace App\Jobs;

use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use App\Notifications\NotificationModel;
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

    protected Reserva $reserva;

    protected array $validatedData;

    protected User $gestor;

    public int $tries = 3;

    public function __construct(Reserva $reserva, array $validatedData, User $gestor)
    {
        $this->reserva = $reserva;
        $this->validatedData = $validatedData;
        $this->gestor = $gestor;
    }

    public function handle(ConflictDetectionService $conflictService): void
    {
        try {
            DB::transaction(function () use ($conflictService) {
                // --- SETUP INICIAL ---
                $scope = $this->validatedData['evaluation_scope'];
                $agendasDoGestorIds = $this->gestor->agendas()->pluck('id');
                $motivoDoGestor = $this->validatedData['motivo'] ?? null;
                $horariosDaAvaliacao = collect($this->validatedData['horarios_avaliados']);

                $conflitosMap = $conflictService->findConflictsFor($this->reserva->id);
                $horariosConflitantesIds = $conflitosMap->keys();

                if ($scope === 'single') {
                    // --- LÓGICA PARA 'APENAS ESTA SEMANA' (JÁ ESTAVA CORRETA) ---
                    foreach ($horariosDaAvaliacao as $avaliacao) {
                        $horarioId = $avaliacao['id'];
                        $statusDoGestor = $avaliacao['status'] === 'solicitado' ? 'em_analise' : $avaliacao['status'];
                        $justificativaFinal = $motivoDoGestor;
                        $statusFinal = $statusDoGestor;

                        if ($horariosConflitantesIds->contains($horarioId)) {
                            $statusFinal = 'indeferida';
                            $justificativaFinal = $conflitosMap->get($horarioId)->conflict_details;
                        }

                        Horario::where('id', $horarioId)->whereIn('agenda_id', $agendasDoGestorIds)
                            ->update([
                                'situacao' => $statusFinal,
                                'user_id' => $this->gestor->id,
                                'justificativa' => $justificativaFinal,
                            ]);
                    }

                } else { // recurring
                    // --- LÓGICA RECORRENTE TOTALMENTE REFEITA ---

                    // FASE 1: Lidar com as exceções. Marcar TODOS os conflitos da reserva como indeferidos.
                    if ($horariosConflitantesIds->isNotEmpty()) {
                        foreach ($horariosConflitantesIds as $id) {
                            $justificativa = $conflitosMap->get($id)->conflict_details ?? 'Conflito com outra reserva.';
                            Horario::where('id', $id)->update([
                                'situacao' => 'indeferida',
                                'justificativa' => $justificativa,
                                'user_id' => $this->gestor->id,
                            ]);
                        }
                    }

                    // FASE 2: Aplicar as decisões do gestor para cada padrão de horário recorrente.
                    $processedPatterns = [];
                    foreach ($horariosDaAvaliacao as $avaliacao) {
                        $horarioId = $avaliacao['id'];

                        // Pula os horários que já foram tratados como conflitos
                        if ($horariosConflitantesIds->contains($horarioId)) {
                            continue;
                        }

                        $horarioFonte = $this->reserva->horarios()->find($horarioId);
                        if (! $horarioFonte) {
                            continue;
                        }

                        $dayOfWeek = Carbon::parse($horarioFonte->data)->dayOfWeek;

                        // O padrão agora inclui o horário de início, garantindo a granularidade
                        $pattern = "{$horarioFonte->agenda_id}-{$horarioFonte->horario_inicio}-{$dayOfWeek}";

                        if (in_array($pattern, $processedPatterns)) {
                            continue; // Já processamos este padrão (ex: outra Quarta às 10h na mesma semana)
                        }

                        $statusParaReplicar = $avaliacao['status'] === 'solicitado' ? 'em_analise' : $avaliacao['status'];
                        $justificativaParaReplicar = $statusParaReplicar === 'indeferida' ? $motivoDoGestor : null;

                        // Atualiza todos os horários que correspondem a este padrão,
                        // exceto os que já foram marcados como conflito.
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
                $this->atualizarStatusGeralDaReserva($this->reserva);
            });

            $this->reserva->refresh();
            $horariosRecemAprovados = $this->reserva->horarios()
                ->where('situacao', 'deferida')
                ->whereIn('id', collect($this->validatedData['horarios_avaliados'])->where('status', 'deferida')->pluck('id'))
                ->get();

            if ($horariosRecemAprovados->isNotEmpty()) {
                $this->triggerConflictRevalidation($horariosRecemAprovados);
            }
            $partesDoNome = explode(' ', $this->gestor->name);
            $doisPrimeirosNomes = implode(' ', array_slice($partesDoNome, 0, 2));
            $this->reserva->user->notify(new NotificationModel(
                'Sua reserva foi avaliada',
                "A reserva '{$this->reserva->titulo}' foi avaliada. Status atual: {$this->reserva->situacao_formatada}.",
                route('reservas.show', ['reserva' => $this->reserva->id])
            ));

        } catch (Exception $e) {
            Log::error("Falha no Job AvaliarReservaJob para reserva {$this->reserva->id}: ".$e->getMessage());
            $this->fail($e);
        }
    }

    public function failed(Throwable $exception): void
    {
        $errorMessage = "Ocorreu um erro ao processar sua avaliação para a reserva '{$this->reserva->titulo}'.";
        if (config('app.debug')) {
            $errorMessage .= ' Detalhe do erro: '.$exception->getMessage();
        } else {
            $errorMessage .= ' A equipe de suporte foi notificada.';
        }
        $this->gestor->notify(new NotificationModel(
            'Falha na Avaliação',
            $errorMessage,
            route('gestor.reservas.show', $this->reserva->id)
        ));
    }

    /**
     * Dispara jobs de revalidação para outras reservas que possam ter se tornado conflitantes.
     */
    private function triggerConflictRevalidation(Collection $horariosAprovados): void
    {
        $slotsOcupados = $horariosAprovados->map(fn ($h) => ['data' => $h->data, 'agenda_id' => $h->agenda_id])
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
            })->select('id')->get(); // Otimização: seleciona apenas o ID

        foreach ($reservasParaRevalidar as $reserva) {
            Log::info("Disparando revalidação de conflito para Reserva ID {$reserva->id} devido à aprovação da Reserva ID {$this->reserva->id}");
            ValidateReservationConflictsJob::dispatch($reserva);
        }
    }

    private function atualizarStatusGeralDaReserva(Reserva $reserva)
    {
        $statusCounts = DB::table('horarios')->where('reserva_id', $reserva->id)
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

        $novaSituacaoGeral = 'em_analise';
        if ($deferidosCount === $totalHorarios) {
            $novaSituacaoGeral = 'deferida';
        } elseif ($indeferidosCount === $totalHorarios) {
            $novaSituacaoGeral = 'indeferida';
        } elseif ($emAnaliseCount > 0) {
            $novaSituacaoGeral = 'em_analise';
        } elseif (($deferidosCount + $indeferidosCount) > 0) {
            $novaSituacaoGeral = 'parcialmente_deferida';
        }
        $reserva->situacao = $novaSituacaoGeral;
        $reserva->save();
    }
}
