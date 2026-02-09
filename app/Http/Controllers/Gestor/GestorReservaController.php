<?php

namespace App\Http\Controllers\Gestor;

use App\Http\Controllers\Controller;
use App\Http\Requests\AvaliarReservaRequest;
use App\Jobs\AvaliarReservaJob;
use App\Models\Reserva;
use App\Services\ConflictDetectionService;
use Carbon\Carbon;
use Exception;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class GestorReservaController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $gestor = Auth::user();
        $agendasDoGestorIds = $gestor->agendas()->pluck('id');
        $filters = $request->only(['search', 'situacao', 'reserva']);

        $dataReferencia = Carbon::parse($request->input('semana', 'today'))->locale('pt_BR');
        $inicioSemana = $dataReferencia->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $fimSemana = $dataReferencia->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        $reservasParaAvaliar = Reserva::query()
            ->select(['id', 'titulo', 'descricao', 'situacao', 'user_id', 'data_inicial', 'data_final'])
            ->whereHas('horarios', fn ($q) => $q->whereIn('agenda_id', $agendasDoGestorIds))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(fn ($q) => $q->where('titulo', 'like', "%{$search}%")->orWhere('descricao', 'like', "%{$search}%"));
            })
            ->when($filters['situacao'] ?? null, fn ($q, $s) => $q->where('situacao', $s), fn ($q) => $q->where('situacao', '!=', 'inativa'))
            ->with([
                'user:id,name',
                'horarios' => function ($query) use ($agendasDoGestorIds) {
                    $query->whereIn('agenda_id', $agendasDoGestorIds)->limit(1)->with([
                        // CORREÇÃO: Adicionado 'turno' ao select da agenda
                        'agenda:id,espaco_id,turno',
                        'agenda.espaco:id,nome',
                    ]);
                },
            ])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $reservaToShow = null;
        if ($filters['reserva'] ?? null) {
            $reservaToShow = Reserva::with([
                'user',
                'horarios' => function ($query) use ($agendasDoGestorIds, $inicioSemana, $fimSemana) {
                    $query->whereIn('agenda_id', $agendasDoGestorIds)
                        ->whereBetween('data', [$inicioSemana, $fimSemana])
                        ->orderBy('data')->orderBy('horario_inicio')
                        ->with([
                            // CORREÇÃO: Adicionado 'turno' aqui também
                            'agenda' => function ($agendaQuery) {
                                $agendaQuery->select('id', 'espaco_id', 'turno', 'user_id') // Seleciona colunas de agenda
                                    ->with('espaco.andar.modulo'); // E seus relacionamentos
                            },
                            'avaliador',
                        ]);
                },
            ])->find($filters['reserva']);
        }

        return Inertia::render('Reservas/Gestor/ReservasGestorPage', [
            'reservas' => $reservasParaAvaliar,
            'filters' => $filters,
            'reservaToShow' => $reservaToShow,
            'semana' => ['inicio' => $inicioSemana, 'fim' => $fimSemana, 'referencia' => $dataReferencia->format('Y-m-d')],
        ]);
    }

    public function show(Request $request, Reserva $reserva, ConflictDetectionService $conflictService)
    {
        // Passo 1: AUTORIZAÇÃO.
        // Impede o acesso se o gestor não tiver nenhum horário nesta reserva.
        // Usa o método 'viewForGestor' que criamos na policy.
        $this->authorize('viewForGestor', $reserva);

        $gestor = Auth::user();

        // Passo 2: FILTRAGEM.
        // Pega os IDs das agendas que o gestor realmente gerencia.
        $agendasDoGestorIds = $gestor->agendas()->pluck('id');

        // A lógica de conflitos continua a mesma, pois é bom o gestor saber de todos os conflitos da reserva
        $conflitosMap = $conflictService->findConflictsFor($reserva->id);

        // Determinar a semana que será exibida.
        $dataReferencia = Carbon::parse($request->input('semana', $reserva->data_inicial))->locale('pt_BR');
        $inicioSemana = $dataReferencia->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $fimSemana = $dataReferencia->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        // Carrega APENAS os horários da semana visível E QUE PERTENCEM AO GESTOR.
        $horariosDaSemana = $reserva->horarios()
            ->whereIn('agenda_id', $agendasDoGestorIds) // <-- FILTRO DE SEGURANÇA ADICIONADO
            ->whereBetween('data', [$inicioSemana, $fimSemana])
            ->with('agenda.espaco')
            ->get();

        // Itera sobre os horários JÁ FILTRADOS da semana e os "etiqueta" com conflitos.
        foreach ($horariosDaSemana as $horario) {
            $horario->is_conflicted = false;
            if ($conflitosMap->has($horario->id)) {
                $conflito = $conflitosMap->get($horario->id);
                $horario->is_conflicted = true;
                $horario->conflict_details = "Conflito com a reserva '{$conflito->conflito_reserva_titulo}' de {$conflito->conflito_user_name}.";
            }
        }

        $reserva->load(['user']);
        $reserva->setRelation('horarios', $horariosDaSemana);

        return Inertia::render('Reservas/Gestor/AvaliarReservaPage', [
            'reserva' => $reserva,
            'semana' => ['referencia' => $dataReferencia->format('Y-m-d')],
            'todosOsConflitos' => $conflitosMap,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AvaliarReservaRequest $request, Reserva $reserva)
    {
        $gestor = Auth::user();
        $validated = $request->validated();

        try {
            // Despacha o Job para a fila com os dados necessários
            AvaliarReservaJob::dispatch($reserva, $validated, $gestor);

            // Retorna uma resposta imediata para o gestor
            return Redirect::route('gestor.reservas.index')
                ->with('success', 'Avaliação enviada para processamento em segundo plano. Você será notificado quando concluir.');

        } catch (Exception $e) {
            Log::error("Erro ao despachar AvaliarReservaJob para reserva {$reserva->id}: ".$e->getMessage());

            return back()->with('error', 'Ocorreu um erro ao enviar a avaliação para processamento.');
        }
    }
}
