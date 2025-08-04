<?php

namespace App\Http\Controllers\Gestor;

use App\Models\Agenda;
use App\Models\Reserva;
use Exception;
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
                    $query->with(['agenda.espaco.andar.modulo.unidade.instituicao', 'agenda.horarios.reservas']);
                },
            ])
            ->latest();

        // 6. Pagina o resultado final.
        $reservasParaAvaliar = $reservasQuery->paginate(10)->withQueryString();

        $reservaToShow = Reserva::find($filters['reserva'] ?? null);
        $reservaToShow != null ? $reservaToShow->load([
            'horarios.agenda.espaco.andar.modulo.unidade.instituicao',
            'horarios.agenda.user.setor'
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
                $query->with(['agenda.espaco.andar.modulo.unidade.instituicao', 'agenda.horarios.reservas', 'agenda.user']);
            },
        ]);


        return Inertia::render('Reservas/Gestor/AvaliarReservaPage', [
            'reserva' => $reserva
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
     */
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
                    $reserva->horarios()->updateExistingPivot($horarioId, [
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reserva $reserva)
    {
        //
    }


    protected function atualizarStatusGeralDaReserva(Reserva $reserva)
    {
        // Recarrega os status da tabela pivô para ter os dados mais recentes.
        $statusDosHorarios = $reserva->horarios()->get()->pluck('pivot.situacao');
        if ($statusDosHorarios->every(fn($status) => $status === 'deferida')) {
            $reserva->situacao = 'deferida';
        } elseif ($statusDosHorarios->every(fn($status) => $status === 'indeferida')) {
            $reserva->situacao = 'indeferida';
        } elseif ($statusDosHorarios->contains('deferida')) {
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
    }
}
