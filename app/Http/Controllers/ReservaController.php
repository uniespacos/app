<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ConfirmPasswordRequest;
use App\Http\Requests\StoreReservaRequest;
use App\Http\Requests\UpdateReservaRequest;
use App\Models\Reserva;
use App\Services\ReservaService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ReservaController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected ReservaService $service,
    ) {}

    /**
     * Display the user's reservations listing with week navigation and detail modal support.
     */
    public function index(Request $request): Response
    {
        $data = $this->service->getListingForUser(
            Auth::user(),
            $request->input('semana', 'today'),
            $request->only(['search', 'situacao', 'reserva'])
        );

        return Inertia::render('Reservas/ReservasPage', $data);
    }

    /**
     * Show the form for creating a new reservation.
     */
    public function create(): void {}

    /**
     * Dispatch the async job to create a new reservation.
     */
    public function store(StoreReservaRequest $request): RedirectResponse
    {
        try {
            $this->service->create($request->validated(), Auth::user());

            return redirect()->route('espacos.index')
                ->with('success', 'Sua solicitação foi recebida e está sendo processada em segundo plano!');
        } catch (\Exception $error) {
            Log::error('Erro ao despachar o job de criação de reserva: '.$error->getMessage());

            return redirect()->route('espacos.index')
                ->with('error', 'Não foi possível enviar sua solicitação para processamento. Tente novamente.');
        }
    }

    /**
     * Redirect to the reservation index with the reservation modal open.
     */
    public function show(Reserva $reserva): RedirectResponse
    {
        $this->authorize('view', $reserva);

        // Issue #222: as notificações apontam para esta rota e a URL fica gravada
        // na tabela notifications, então propagar a semana aqui conserta também
        // os links já enviados. Sem isto, index cai no default 'today' e o modal
        // abre numa semana sem horários.
        return redirect()->route('reservas.index', [
            'reserva' => $reserva->id,
            'semana' => $this->service->resolveDataAncora($reserva),
        ]);
    }

    /**
     * Display the reservation edit page with week-filtered schedule.
     */
    public function edit(Request $request, Reserva $reserva): Response
    {
        $this->authorize('update', $reserva);

        $data = $this->service->getEditData($reserva, $request->input('semana', ''));

        return Inertia::render('Espacos/VisualizarEspacoPage', $data);
    }

    /**
     * Dispatch the async job to update a reservation.
     */
    public function update(UpdateReservaRequest $request, Reserva $reserva): RedirectResponse
    {
        $this->authorize('update', $reserva);

        try {
            $this->service->update($reserva, $request->validated(), Auth::user());

            return redirect()->route('reservas.index')
                ->with('success', 'Sua reserva foi enviada para atualização. O processo será concluído em segundo plano.');
        } catch (\Exception $e) {
            Log::error("Erro ao despachar UpdateReservaJob para reserva {$reserva->id}: ".$e->getMessage());

            return back()->with('error', 'Ocorreu um erro ao enviar a atualização para processamento.');
        }
    }

    /**
     * Cancel the specified reservation.
     * Requires password confirmation from the authenticated user.
     */
    public function destroy(ConfirmPasswordRequest $request, Reserva $reserva): RedirectResponse
    {
        $this->authorize('delete', $reserva);

        if (! $request->passwordMatches()) {
            return back()->with('error', 'A senha fornecida está incorreta.');
        }

        try {
            $this->service->cancel($reserva, Auth::user());

            return back()->with('success', 'Reserva cancelada com sucesso!');
        } catch (\Exception $error) {
            Log::error('Erro ao cancelar (inativar) reserva: '.$error->getMessage(), [
                'reserva_id' => $reserva->id,
                'user_id' => Auth::id(),
            ]);

            return back()->with('error', 'Erro ao cancelar a reserva. Por favor, tente novamente.');
        }
    }
}
