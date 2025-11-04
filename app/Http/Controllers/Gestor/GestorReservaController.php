<?php

namespace App\Http\Controllers\Gestor;

use App\Http\Controllers\Controller;
use App\Http\Requests\AvaliarReservaRequest;
use App\Jobs\AvaliarReservaJob;
use App\Models\Horario;
use App\Models\Reserva;
use App\ReservaServiceInterface;
use App\Services\ConflictDetectionService;
use Carbon\Carbon;
use Exception;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class GestorReservaController extends Controller
{
    use AuthorizesRequests;
    protected ReservaServiceInterface $reservaService;
    public function __construct(ReservaServiceInterface $reservaService)
    {
        $this->reservaService = $reservaService;
    }

    /**
     * Pagina de listar reservas para o gestor avaliar
     * @param Request $request
     * @return Response
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'situacao', 'reserva']);
        $semanaInput = $request->input('semana');

        $data = $this->reservaService->getDadosToIndexGestor($filters,$semanaInput, Auth::id());

        return Inertia::render('Reservas/Gestor/ReservasGestorPage', [
            'reservas' => $data['reservas'],
            'filters' => $data['filters'],
            'reservaToShow' => $data['reservaToShow'],
            'semana' => $data['semana'],
        ]);
    }

    /**
     *  Responsável por redirecionar para pagina de avaliar reserva
     * @param Request $request
     * @param Reserva $reserva
     * @param ConflictDetectionService $conflictService
     * @return Response
     */
    public function show(Request $request, Reserva $reserva, ConflictDetectionService $conflictService)
    {
        $this->authorize('viewForGestor', $reserva);
        $semanaInicio = $request->input('semana');
        $gestorId = Auth::id();
        $data = $this->reservaService->showReservaAvaliacao($reserva, $gestorId, $semanaInicio);



        return Inertia::render('Reservas/Gestor/AvaliarReservaPage', [
            'reserva' => $data['reserva'],
            'semana' =>  $data['semana'],
            'todosOsConflitos' =>$data['todosOsConflitos'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AvaliarReservaRequest $request, Reserva $reserva)
    {
        $validated = $request->validated();
        try {
            $this->reservaService->enfileirarAvaliacao($reserva, $validated, Auth::id());
            return Redirect::route('gestor.reservas.index')
                ->with('success', 'Avaliação enviada para processamento em segundo plano. Você será notificado quando concluir.');
        } catch (Exception $e) {
            Log::error("Erro ao despachar AvaliarReservaJob para reserva {$reserva->id}: " . $e->getMessage());
            return back()->with('error', 'Ocorreu um erro ao enviar a avaliação para processamento.');
        }
    }
}
