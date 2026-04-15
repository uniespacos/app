<?php

declare(strict_types=1);

namespace App\Http\Controllers\Gestor;

use App\Http\Controllers\Controller;
use App\Models\Espaco;
use App\Services\EspacoService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GestorEspacoController extends Controller
{
    public function __construct(
        protected EspacoService $service,
    ) {}

    /**
     * Display the gestor listing of spaces.
     */
    public function index(): Response
    {
        return Inertia::render('Espacos/EspacosPage', [
            'espacos' => Espaco::all(),
        ]);
    }

    /**
     * Display the specified space with its agenda managers and reserved slots.
     */
    public function show(Espaco $espaco): Response|RedirectResponse
    {
        try {
            $data = $this->service->getWithAgendaData($espaco);

            return Inertia::render('Espacos/VisualizarEspacoPage', $data);
        } catch (\Exception $th) {
            return redirect()->route('espacos.index')
                ->with('error', 'Espaço sem gestor cadastrado - Aguardando cadastro');
        }
    }
}
