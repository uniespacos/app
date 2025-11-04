<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreReservaRequest;
use App\Models\Reserva;
use App\ReservaServiceInterface;
use Exception;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReservaController extends Controller
{
    use AuthorizesRequests;
    protected ReservaServiceInterface $reservaService;

    public function __construct(ReservaServiceInterface $reservaService)
    {
        $this->reservaService = $reservaService;
    }

    /**
     * Display a listing of the resource.
     * @param Request $request
     * @return Response|RedirectResponse
     */
    public function index(Request $request): Response | RedirectResponse
    {
        $filters = $request->only(['search', 'situacao', 'reserva']);
        $semanaInput = $request->input('semana');

        try {
            $data = $this->reservaService->getDadosToIndexUser($filters, $semanaInput, Auth::id());
            return Inertia::render('Reservas/ReservasPage', $data);
        } catch (Exception $e) {
            Log::error('Erro ao buscar dados para index de Reservas: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Não foi possível carregar os dados das reservas.');
        }
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
    public function store(StoreReservaRequest $request): RedirectResponse
    {
        try {
            $dadosValidados = $request->validated();

            $this->reservaService->enfileirarCriacao($dadosValidados, Auth::id());

            return redirect()->route('espacos.index')
                ->with('success', 'Sua solicitação foi recebida e está sendo processada em segundo plano!');
        } catch (Exception $error) {
            Log::error('Erro ao despachar o job de criação de reserva: ' . $error->getMessage());
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

        $validated = array_merge(
            $request->validated(),
            $request->validate([
                'edit_scope' => ['required', 'string', Rule::in(['single', 'recurring'])],
                'edited_week_date' => ['required_if:edit_scope,single', 'date'],
                'horarios_solicitados' => ['present', 'array'],
            ])
        );

        try {
            $this->reservaService->enfileirarAtualizacao($reserva, $validated, Auth::id());

            return redirect()->route('reservas.index')
                ->with('success', 'Sua reserva foi enviada para atualização. O processo será concluído em segundo plano.');

        } catch (Exception $e) {
            Log::error("Erro ao despachar UpdateReservaJob para reserva {$reserva->id}: " . $e->getMessage());
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
        $this->authorize('update', $reserva); // A autorização fica no controller

        try {
            $semanaInput = $request->input('semana');

            $data = $this->reservaService->getDadosToEdit($reserva, $semanaInput);

            return Inertia::render('Espacos/VisualizarEspacoPage', $data);
        } catch (Exception $e) {
            Log::error("Erro ao carregar dados de edição para reserva {$reserva->id}: " . $e->getMessage());
            return redirect()->route('reservas.index')->with('error', 'Não foi possível carregar os dados para edição.');
        }
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
        try {
            $response = $this->reservaService->cancelarReserva($reserva, Auth::id(), $request->input('password'));
            return back()->with($response);
        } catch (Exception $error) {
            return back()->with('error', 'Erro ao cancelar a reserva. Por favor, tente novamente.');
        }
    }
}
