<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservaRequest;
use App\Jobs\ProcessarCriacaoReserva;
use App\Jobs\UpdateReservaJob;
use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\Horario;
use App\Models\Reserva;
use App\Notifications\ReservationCanceledNotification;
use Carbon\Carbon;
use Exception;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ReservaController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request) // Recebe a Request
    {
        $user = Auth::user();
        $filters = $request->only(['search', 'situacao', 'reserva']);

        // 1. Pega a data de referência da semana a partir da request.
        // Se o parâmetro 'semana' não for enviado, usa a data de hoje.
        $dataReferencia = Carbon::parse($request->input('semana', 'today'))->locale('pt_BR');

        // 2. Calcula o início (segunda-feira) e o fim (domingo) da semana.
        $inicioSemana = $dataReferencia->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $fimSemana = $dataReferencia->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        // 3. Query principal para a lista de reservas (paginada)
        $reservas = Reserva::query()
            ->where('user_id', $user->id)
            ->where('situacao', '!=', 'inativa')
            // Otimização: Só busca reservas que estejam ativas no período da semana
            ->where(function ($query) use ($inicioSemana, $fimSemana) {
                $query->where('data_inicial', '<=', $fimSemana)
                    ->where('data_final', '>=', $inicioSemana);
            })
            ->when($filters['search'] ?? null, function ($query, $search) { // Filtro de busca
                $query->where('titulo', 'like', '%'.$search.'%');
            })
            ->when($filters['situacao'] ?? null, function ($query, $situacao) { // Filtro de situação
                $query->where('situacao', $situacao);
            })
            ->with([
                // 4. A MÁGICA: Filtra o relacionamento 'horarios' para a semana específica.
                'horarios' => function ($query) use ($inicioSemana, $fimSemana) {
                    $query->whereBetween('data', [$inicioSemana, $fimSemana])
                        ->orderBy('data')->orderBy('horario_inicio')
                        ->with(['agenda.espaco']); // Eager load necessário para a lista
                },
                'user:id,name',
            ])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Adiciona a flag 'can_update' para cada reserva no paginador
        $reservas->getCollection()->transform(function ($reserva) use ($user) {
            $reserva->can_update = $user->can('update', $reserva);

            return $reserva;
        });

        // 5. Query para a reserva específica que será exibida no modal (reservaToShow)
        $reservaToShow = null;
        if ($filters['reserva'] ?? null) {
            $reservaToShow = Reserva::with([
                'user',
                // O mesmo filtro de semana é aplicado aqui!
                'horarios' => function ($query) use ($inicioSemana, $fimSemana) {
                    $query->whereBetween('data', [$inicioSemana, $fimSemana])
                        ->orderBy('data')->orderBy('horario_inicio')
                        ->with(['agenda.espaco.andar.modulo.unidade', 'avaliador']);
                },
            ])->find($filters['reserva']);

            if ($reservaToShow) {
                $reservaToShow->can_update = $user->can('update', $reservaToShow);
            }
        }

        return Inertia::render('Reservas/ReservasPage', [
            'reservas' => $reservas,
            'filters' => $filters,
            'reservaToShow' => $reservaToShow,
            // 6. Envia as informações da semana atual para o frontend.
            // Isso é crucial para a navegação de semana no modal.
            'semana' => [
                'inicio' => $inicioSemana,
                'fim' => $fimSemana,
                'referencia' => $dataReferencia->format('Y-m-d'),
            ],
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
    public function store(StoreReservaRequest $request)
    {
        try {
            $dadosValidados = $request->validated();
            $solicitante = Auth::user();

            ProcessarCriacaoReserva::dispatch($dadosValidados, $solicitante);

            return redirect()->route('espacos.index')
                ->with('success', 'Sua solicitação foi recebida e está sendo processada em segundo plano!');
        } catch (Exception $error) {
            Log::error('Erro ao despachar o job de criação de reserva: '.$error->getMessage());

            return redirect()->route('espacos.index')
                ->with('error', 'Não foi possível enviar sua solicitação para processamento. Tente novamente.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreReservaRequest $request, Reserva $reserva)
    {
        $this->authorize('update', $reserva);
        $user = Auth::user();

        // Adiciona a validação extra para os campos de edição
        $validated = array_merge(
            $request->validated(),
            $request->validate([
                'edit_scope' => ['required', 'string', Rule::in(['single', 'recurring'])],
                'edited_week_date' => ['required_if:edit_scope,single', 'date'],
                // Certifique-se que horarios_solicitados seja um array, mesmo que vazio
                'horarios_solicitados' => ['present', 'array'],
            ])
        );

        try {
            // Despacha o Job para a fila com os dados necessários
            UpdateReservaJob::dispatch($reserva, $validated, $user);

            // Retorna uma resposta imediata para o usuário
            return redirect()->route('reservas.index')
                ->with('success', 'Sua reserva foi enviada para atualização. O processo será concluído em segundo plano.');

        } catch (Exception $e) {
            Log::error("Erro ao despachar UpdateReservaJob para reserva {$reserva->id}: ".$e->getMessage());

            return back()->with('error', 'Ocorreu um erro ao enviar a atualização para processamento.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Reserva $reserva)
    {
        return redirect()->route('reservas.index', ['reserva' => $reserva->id]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Reserva $reserva)
    {
        // --- INÍCIO DA CORREÇÃO ---

        // 1. Busca o primeiro horário agendado em ordem cronológica.
        $primeiroHorario = $reserva->horarios()->orderBy('data', 'asc')->first();

        // 2. Usa a data do primeiro horário como padrão. Se não houver nenhum (reserva vazia),
        // usa a data_inicial da reserva como um fallback seguro.
        $dataPadrao = $primeiroHorario ? $primeiroHorario->data : $reserva->data_inicial;

        // 3. Usa a data padrão que acabamos de encontrar como fallback para a data de referência,
        // caso o parâmetro 'semana' não venha na URL.
        $dataReferencia = Carbon::parse($request->input('semana', $dataPadrao))->locale('pt_BR');

        // --- FIM DA CORREÇÃO ---

        $inicioSemana = $dataReferencia->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $fimSemana = $dataReferencia->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        // Carrega a reserva com os dados necessários para a tela de edição.
        $reserva->load([
            'user',
            // Carrega APENAS os horários da semana de referência
            'horarios' => function ($query) use ($inicioSemana, $fimSemana) {
                $query->whereBetween('data', [$inicioSemana, $fimSemana])
                    ->orderBy('data')->orderBy('horario_inicio')
                    ->with('agenda'); // with() para carregar a agenda de cada horário
            },
        ]);

        // Carrega o espaço relacionado para poder montar o calendário
        $espaco = $reserva->horarios->first()->agenda->espaco ?? null;

        if (! $espaco) {
            // Fallback caso a reserva não tenha horários na semana atual
            $espaco = Espaco::whereHas('agendas.horarios.reserva', fn ($q) => $q->where('id', $reserva->id))->firstOrFail();
        }

        // Carrega os dados do espaço e os horários de outras reservas na mesma semana
        $espaco->load([
            'andar.modulo.unidade.instituicao',
            'agendas' => function ($query) use ($inicioSemana, $fimSemana) {
                $query->with([
                    'user.setor',
                    'horarios' => function ($q) use ($inicioSemana, $fimSemana) {
                        $q->where('situacao', 'deferida')
                            ->whereBetween('data', [$inicioSemana, $fimSemana])
                            ->with(['reserva.user', 'avaliador']);
                    },
                ]);
            },
        ]);

        return Inertia::render('Espacos/VisualizarEspacoPage', [
            'espaco' => $espaco,
            'reserva' => $reserva,
            'isEditMode' => true,
            'semana' => [
                'inicio' => $inicioSemana,
                'fim' => $fimSemana,
                'referencia' => $dataReferencia->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Reserva $reserva)
    {
        $this->authorize('delete', $reserva);
        $request->validate([
            'password' => 'required',
        ]);

        $user = Auth::user(); // Obtém o usuário logado

        // 2. Verificar se o usuário existe e se a senha fornecida corresponde à senha do usuário
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return back()->with('error', 'A senha fornecida está incorreta.');
        }

        try {
            DB::transaction(function () use ($reserva) {

                // 1. Itera sobre cada horário associado a esta reserva
                // para atualizar a situação na tabela pivô (horario_reserva).
                foreach ($reserva->horarios as $horario) {
                    $gestor = Agenda::whereId($horario['agenda_id'])
                        ->with('user') // Carrega o gestor da agenda
                        ->first()
                        ->user;
                    $gestores[] = $gestor; // Coleta os gestores para notificação
                    $reserva->horarios()->update([
                        'situacao' => 'inativa',
                    ]);
                }
                $gestores = array_unique($gestores); // Remove gestores duplicados

                foreach ($gestores as $gestor) {
                    $gestor->notify(
                        new ReservationCanceledNotification(
                            $reserva,
                            $user
                        )
                    );
                }
                // 2. Atualiza a situação da própria reserva para 'inativa'
                $reserva->update(['situacao' => 'inativa']);
            });

            return back()->with('success', 'Reserva cancelada com sucesso!');
        } catch (Exception $error) {
            Log::error('Erro ao cancelar (inativar) reserva: '.$error->getMessage(), [
                'reserva_id' => $reserva->id,
                'user_id' => Auth::id(),
            ]);

            return back()->with('error', 'Erro ao cancelar a reserva. Por favor, tente novamente.');
        }
    }
}
