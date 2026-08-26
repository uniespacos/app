<?php

declare(strict_types=1);

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Models\Chamado;
use App\Services\ChamadoService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstitucionalChamadoController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected ChamadoService $service,
    ) {}

    /**
     * Fila de chamados orfaos: reports em espacos sem gestor atribuido.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewOrfaos', Chamado::class);

        $filters = array_filter($request->only(['tipo_id', 'categoria_id']));

        return Inertia::render('Institucional/ChamadosOrfaosPage', $this->service->getListagemOrfaos($filters));
    }
}
