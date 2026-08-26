<?php

declare(strict_types=1);

namespace App\Http\Controllers\Gestor;

use App\Http\Controllers\Controller;
use App\Http\Requests\TriarChamadoRequest;
use App\Models\Chamado;
use App\Services\ChamadoService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class GestorChamadoController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected ChamadoService $service,
    ) {}

    /**
     * Fila de chamados dos espacos que o gestor administra.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Chamado::class);

        $filters = $request->only(['status', 'tipo_id', 'categoria_id']);

        return Inertia::render('Gestor/ChamadosPage', $this->service->getListagemParaGestor(
            Auth::user(),
            array_filter($filters)
        ));
    }

    /**
     * Registra a triagem do gestor sobre um chamado.
     */
    public function update(TriarChamadoRequest $request, Chamado $chamado): RedirectResponse
    {
        $this->authorize('update', $chamado);

        try {
            $this->service->triar($chamado, Auth::user(), $request->validated());

            return redirect()->route('gestor.chamados.index')
                ->with('success', 'Chamado atualizado com sucesso!');
        } catch (\Exception $e) {
            Log::error('Erro ao triar chamado: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Ocorreu um erro inesperado ao atualizar o chamado.');
        }
    }
}
