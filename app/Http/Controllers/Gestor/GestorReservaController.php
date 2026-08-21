<?php

declare(strict_types=1);

namespace App\Http\Controllers\Gestor;

use App\Http\Controllers\Controller;
use App\Http\Requests\AvaliarReservaRequest;
use App\Models\Reserva;
use App\Services\ReservaService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class GestorReservaController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected ReservaService $service,
    ) {}

    /**
     * Display the gestor's reservation listing with week navigation and detail modal support.
     */
    public function index(Request $request): Response
    {
        $data = $this->service->getGestorListing(
            Auth::user(),
            $request->input('semana', 'today'),
            $request->only(['search', 'situacao', 'arquivo', 'reserva'])
        );

        return Inertia::render('Reservas/Gestor/ReservasGestorPage', $data);
    }

    /**
     * Display the reservation detail page for gestor evaluation with conflict data.
     */
    public function show(Request $request, Reserva $reserva): Response
    {
        $this->authorize('viewForGestor', $reserva);

        $data = $this->service->getForGestorReview(
            $reserva,
            Auth::user(),
            $request->input('semana', '')
        );

        return Inertia::render('Reservas/Gestor/AvaliarReservaPage', $data);
    }

    /**
     * Dispatch the async job to evaluate a reservation.
     */
    public function update(AvaliarReservaRequest $request, Reserva $reserva): RedirectResponse
    {
        $this->authorize('viewForGestor', $reserva);

        try {
            $this->service->evaluate($reserva, $request->validated(), Auth::user());

            return redirect()->route('gestor.reservas.index')
                ->with('success', 'Avaliação enviada para processamento em segundo plano. Você será notificado quando concluir.');
        } catch (\Exception $e) {
            Log::error('Erro ao despachar AvaliarReservaJob', [
                'reserva_id' => $reserva->id,
                'gestor_id' => Auth::id(),
                'exception' => $e,
            ]);

            return back()->with('error', 'Ocorreu um erro ao enviar a avaliação para processamento.');
        }
    }
}
