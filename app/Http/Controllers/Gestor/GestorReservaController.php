<?php

namespace App\Http\Controllers\Gestor;

use App\Models\Agenda;
use App\Models\Horario;
use App\Models\Reserva;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Http\Requests\AvaliarReservaRequest;
use App\Notifications\NotificationModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class GestorReservaController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $gestor = Auth::user();

        // 1. Pega os IDs das agendas que o gestor gerencia.
        $agendasDoGestorIds = Agenda::where('user_id', $gestor->id)->pluck('id');

        // Pega os filtros da requisição (URL query string)
        $filters = $request->only(['search', 'situacao', 'reserva']);

        // 2. Inicia a query a partir do modelo Reserva.
        $reservasQuery = Reserva::query()
            // 3. O PULO DO GATO: Filtra as reservas que TÊM ('whereHas') um relacionamento
            // com 'horarios' onde a 'agenda_id' pertence às agendas do gestor.
            ->whereHas('horarios', function ($query) use ($agendasDoGestorIds) {
                $query->whereIn('horarios.agenda_id', $agendasDoGestorIds);
            })
            // 4. Agora podemos aplicar os filtros de busca normalmente nesta query já restringida.
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('titulo', 'like', '%' . $search . '%')
                        ->orWhere('descricao', 'like', '%' . $search . '%');
                });
                $query->orderByRaw(
                    "CASE WHEN titulo LIKE ? THEN 1 ELSE 2 END",
                    ['%' . $search . '%']
                );
            })
            ->when(
                $filters['situacao'] ?? null,
                // 1. Função a ser executada SE 'situacao' EXISTIR no filtro
                function ($query, $situacao) {
                    $query->where('situacao', $situacao);
                },
                // 2. Função a ser executada SE 'situacao' NÃO EXISTIR no filtro
                function ($query) {
                    $query->where('situacao', '!=', 'inativa');
                }
            )
            // 5. Carrega os relacionamentos necessários para a exibição.
            ->with([
                'user', // O usuário que solicitou a reserva
                'horarios' => function ($query) use ($agendasDoGestorIds) {
                    // Opcional, mas útil: só mostra os horários que são das agendas do gestor.
                    $query->whereIn('agenda_id', $agendasDoGestorIds)
                        ->orderBy('data')
                        ->orderBy('horario_inicio');
                    $query->with([
                        'agenda' => function ($query) {
                            $query->with([
                                'user.setor', // Carrega o gestor (user) da agenda e seu setor
                                'horarios' => function ($q) {
                                    // Carrega as reservas dos horários APROVADOS (deferidos)
                                    $q->where('situacao', 'deferida')
                                        ->with(['reserva.user', 'avaliador']);
                                },
                                'espaco.andar.modulo.unidade.instituicao'
                            ]);
                        },
                    ]);
                },
            ])
            ->latest();

        // 6. Pagina o resultado final.
        $reservasParaAvaliar = $reservasQuery->paginate(10)->withQueryString();

        $reservaToShow = Reserva::find($filters['reserva'] ?? null);
        $reservaToShow != null ? $reservaToShow->load([
            'horarios' => function ($query) use ($agendasDoGestorIds) {
                // Opcional, mas útil: só mostra os horários que são das agendas do gestor.
                $query->whereIn('agenda_id', $agendasDoGestorIds)
                    ->orderBy('data')
                    ->orderBy('horario_inicio');
                $query->with([
                    'agenda' => function ($query) {
                        $query->with([
                            'user.setor', // Carrega o gestor (user) da agenda e seu setor
                            'horarios' => function ($q) {
                                // Carrega as reservas dos horários APROVADOS (deferidos)
                                $q->where('situacao', 'deferida')
                                    ->with(['reserva.user', 'avaliador']);
                            },
                            'espaco.andar.modulo.unidade.instituicao'
                        ]);
                    },
                ]);
            },
        ]) : null;
        // 7. Renderiza a view do Inertia com os dados no formato esperado pelo front-end.
        return Inertia::render('Reservas/Gestor/ReservasGestorPage', [
            'reservas' => $reservasParaAvaliar,
            'filters' => $filters,
            'reservaToShow' => $reservaToShow, // Envia a reserva selecionada para exibição
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Não utiliza no gestor
    }

    /**
     * Display the specified resource.
     */
    public function show(Reserva $reserva)
    {
        $gestor = Auth::user();
        // Carrega a reserva com todos os dados necessários para a tela de detalhes do gestor.
        $agendasDoGestorIds = Agenda::where('user_id', $gestor->id)->pluck('id');

        // Se o gestor não gerencia agendas, não deveria estar aqui.
        // Podemos retornar um erro ou redirecionar.
        if ($agendasDoGestorIds->isEmpty()) {
            abort(403, 'Acesso não autorizado.');
        }

        $reserva->load([
            'user', // O usuário que solicitou a reserva
            'horarios' => function ($query) use ($agendasDoGestorIds) {
                // Opcional, mas útil: só mostra os horários que são das agendas do gestor.
                $query->whereIn('agenda_id', $agendasDoGestorIds)
                    ->orderBy('data')
                    ->orderBy('horario_inicio');
                $query->with([
                    'agenda' => function ($query) {
                        $query->with([
                            'user.setor', // Carrega o gestor (user) da agenda e seu setor
                            'horarios' => function ($q) {
                                // Carrega as reservas dos horários APROVADOS (deferidos)
                                $q->where('situacao', 'deferida')
                                    ->with(['reserva.user', 'avaliador']);
                            },
                            'espaco.andar.modulo.unidade.instituicao'
                        ]);
                    },
                ]);
            },
        ]);
        return Inertia::render('Reservas/Gestor/AvaliarReservaPage', [
            'reserva' => $reserva,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reserva $reserva)
    {
        //
    }

    /**
     * Update the specified resource in storage.
    public function update(AvaliarReservaRequest $request, Reserva $reserva)
    {
        $this->authorize('update', $reserva);
        $validated = $request->validated();
        $horariosAvaliados = collect($validated['horarios_avaliados'])
        ->mapWithKeys(function ($dados) {
            $horario = $dados['dadosReserva'];
            return [$horario['horarioDB']['id'] => $dados['status'] === 'solicitado' ? 'em_analise' : $dados['status']];
        });
        $gestor = Auth::user();
        $novaSituacao = $validated['situacao'];
        // 2. Obter um array com os IDs de todas as agendas gerenciadas pelo gestor.
        $agendasDoGestorIds = Agenda::where('user_id', $gestor->id)->pluck('id');


        // Se o gestor não gerencia nenhuma agenda, ele não pode avaliar nada.
        if ($agendasDoGestorIds->isEmpty()) {
            return back()->with('error', 'Você não é gestor de nenhuma agenda.');
        }

        DB::beginTransaction();
        try {

        $reserva->observacao = $validated['observacao'] ?? null; // Atualiza a observação da reserva, se fornecida.
        // 4. Atualiza a 'situacao' na tabela pivô APENAS para os horários encontrados.
            foreach ($horariosAvaliados as $horarioId => $situacao) {
                // Garante que o gestor só pode avaliar horários das suas agendas
                if ($reserva->horarios()->whereIn('agenda_id', $agendasDoGestorIds)->find($horarioId)) {
                    $horario = $reserva->horarios()->find($horarioId);
                    $horario->update([
                        'situacao' => $situacao,
                        'user_id' => $gestor->id,
                        'justificativa' => $situacao === 'indeferida' ? $validated['motivo'] : null, // Justificativa opcional
                    ]);
                }
            }
            // 5. Atualiza o status GERAL da reserva (para 'deferido', 'indeferido', 'parcialmente_deferido').
            $this->atualizarStatusGeralDaReserva($reserva);

            DB::commit(); // Confirma todas as alterações no banco.
            // 6. Notifica o usuário que fez a reserva sobre a avaliação.

            $partesDoNome = explode(' ', $gestor->name);
            $doisPrimeirosNomesArray = array_slice($partesDoNome, 0, 2);
            $resultado = implode(' ', $doisPrimeirosNomesArray);
            $reserva->user->notify(new NotificationModel(
                'Avaliação de Reserva',
                "Sua reserva #{$reserva->id} foi avaliada como '{$novaSituacao}' por {$resultado}.",
                route('reservas.index', ['reserva' => $reserva])
            ));
            return Redirect::route('gestor.reservas.index')->with('success', 'solicitação avaliada com sucesso!');
        } catch (Exception $e) {
            DB::rollBack(); // Em caso de erro, desfaz tudo.
            Log::error("Erro ao avaliar reserva {$reserva->id}: " . $e->getMessage());
            return back()->with('error', 'Ocorreu um erro inesperado ao avaliar a reserva.');
        }
    }
    */
    public function update(AvaliarReservaRequest $request, Reserva $reserva)
    {
        $this->authorize('update', $reserva);
        $gestor = Auth::user();
        $validated = $request->validated();

        $agendasDoGestorIds = $gestor->agendas()->pluck('id');

        if ($agendasDoGestorIds->isEmpty()) {
            return back()->with('error', 'Você não é gestor de nenhuma agenda.');
        }

        DB::beginTransaction();
        try {
            $horariosAvaliadosInput = collect($validated['horarios_avaliados']);
            $motivoIndeferimento = $validated['motivo'] ?? null;

            $processedPatterns = [];

            foreach ($horariosAvaliadosInput as $avaliacao) {
                $horarioId = $avaliacao['dadosReserva']['horarioDB']['id'];
                $novoStatus = $avaliacao['status'] === 'solicitado' ? 'em_analise' : $avaliacao['status'];

                $horarioFonte = Horario::find($horarioId);

                if (!$horarioFonte || $horarioFonte->reserva_id !== $reserva->id || !$agendasDoGestorIds->contains($horarioFonte->agenda_id)) {
                    continue;
                }

                // --- INÍCIO DA CORREÇÃO PARA POSTGRESQL (USANDO WHERERAW) ---

                // 1. Obtém o dia da semana do horário-fonte usando Carbon.
                // A propriedade 'dayOfWeek' do Carbon retorna 0 para Domingo, 1 para Segunda, ..., 6 para Sábado.
                // Isso corresponde ao padrão da função DOW (Day Of Week) do PostgreSQL.
                $carbonDate = Carbon::parse($horarioFonte->data);
                $dayOfWeek = $carbonDate->dayOfWeek;

                // 2. Define o "padrão" do horário recorrente, incluindo o dia da semana.
                $pattern = "{$horarioFonte->agenda_id}-{$horarioFonte->horario_inicio}-{$horarioFonte->horario_fim}-{$dayOfWeek}";

                if (in_array($pattern, $processedPatterns)) {
                    continue;
                }

                // 3. Atualiza TODOS os horários com o mesmo padrão usando whereRaw para compatibilidade.
                Horario::where('reserva_id', $reserva->id)
                    ->where('agenda_id', $horarioFonte->agenda_id)
                    ->where('horario_inicio', $horarioFonte->horario_inicio)
                    ->where('horario_fim', $horarioFonte->horario_fim)
                    // A CONDIÇÃO CRUCIAL, usando a função EXTRACT(DOW FROM ...) do PostgreSQL de forma segura.
                    ->whereRaw('EXTRACT(DOW FROM data) = ?', [$dayOfWeek])
                    ->update([
                        'situacao' => $novoStatus,
                        'user_id' => $gestor->id,
                        'justificativa' => $novoStatus === 'indeferida' ? $motivoIndeferimento : null,
                    ]);

                // --- FIM DA CORREÇÃO ---

                $processedPatterns[] = $pattern;
            }

            $reserva->observacao = $validated['observacao'] ?? $reserva->observacao;
            $this->atualizarStatusGeralDaReserva($reserva);

            DB::commit();

            $reserva->refresh();
            $partesDoNome = explode(' ', $gestor->name);
            $doisPrimeirosNomes = implode(' ', array_slice($partesDoNome, 0, 2));

            $reserva->user->notify(new NotificationModel(
                'Sua reserva foi avaliada',
                "A reserva '{$reserva->titulo}' foi avaliada. Status atual: {$reserva->situacao_formatada}.",
                route('reservas.show', ['reserva' => $reserva->id])
            ));

            return Redirect::route('gestor.reservas.index')->with('success', 'Solicitação avaliada com sucesso!');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Erro ao avaliar reserva {$reserva->id}: " . $e->getMessage());
            return back()->with('error', 'Ocorreu um erro inesperado ao avaliar a reserva.');
        }
    }

    /**
     * Recalcula e atualiza o status geral da reserva com base nos status de seus horários.
     */
    private function atualizarStatusGeralDaReserva(Reserva $reserva)
    {
        $reserva->load('horarios');

        $totalHorarios = $reserva->horarios->count();
        if ($totalHorarios === 0) {
            $reserva->situacao = 'indeferida';
            $reserva->save();
            return;
        }

        $deferidosCount = $reserva->horarios->where('situacao', 'deferida')->count();
        $indeferidosCount = $reserva->horarios->where('situacao', 'indeferida')->count();

        $novaSituacaoGeral = 'em_analise';

        if ($deferidosCount === $totalHorarios) {
            $novaSituacaoGeral = 'deferida';
        } elseif ($indeferidosCount === $totalHorarios) {
            $novaSituacaoGeral = 'indeferida';
        } elseif ($deferidosCount > 0 || $indeferidosCount > 0) {
            $novaSituacaoGeral = 'parcialmente_deferida';
        }

        $reserva->situacao = $novaSituacaoGeral;
        $reserva->save();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reserva $reserva)
    {
        //
    }

    /*
        protected function atualizarStatusGeralDaReserva(Reserva $reserva)
        {
            // Recarrega os status da tabela pivô para ter os dados mais recentes.
            $statusDosHorarios = $reserva->horarios()->get()->pluck('situacao');
            if ($statusDosHorarios->every(fn($status) => $status === 'deferida')) {
                $reserva->situacao = 'deferida';
            } elseif ($statusDosHorarios->every(fn($status) => $status === 'indeferida')) {
                $reserva->situacao = 'indeferida';
            } elseif ($statusDosHorarios->contains(fn($status) => $status !== "em_analise" && $status !== "inativa")) {
                // Se pelo menos um foi deferido (e não todos), é parcial.
                $reserva->situacao = 'parcialmente_deferida';
            } elseif ($statusDosHorarios->every(fn($status) => $status === 'inativa')) {
                // Se pelo menos um foi deferido (e não todos), é parcial.
                $reserva->situacao = 'inativa';
            } else {
                // Se nenhum foi deferido ainda, mas nem todos foram indeferidos, continua em análise.
                $reserva->situacao = 'em_analise';
            }
            $reserva->save();
        }*/
}
