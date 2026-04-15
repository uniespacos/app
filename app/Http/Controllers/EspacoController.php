<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Espaco;
use App\Services\EspacoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EspacoController extends Controller
{
    public function __construct(
        protected EspacoService $service,
    ) {}

    /**
     * Display the public listing of spaces with search and filter support.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $filters = $request->only(['search', 'unidade', 'modulo', 'andar', 'capacidade']);
        $instituicaoId = $user->setor->unidade->instituicao_id;

        $filterOptions = $this->service->getFilterOptions($instituicaoId);

        return Inertia::render('Espacos/EspacosPage', [
            'espacos' => $this->service->getPaginatedForPublic($instituicaoId, $filters)->withQueryString(),
            'unidades' => $filterOptions['unidades'],
            'modulos' => $filterOptions['modulos'],
            'andares' => $filterOptions['andares'],
            'capacidadeEspacos' => $filterOptions['capacidades'],
            'filters' => $filters,
            'user' => $user,
        ]);
    }

    /**
     * Display the specified space with its week-filtered schedule.
     */
    public function show(Request $request, Espaco $espaco): Response|RedirectResponse
    {
        $data = $this->service->getWithWeekSchedule($espaco, $request->input('semana', 'today'));

        if ($espaco->agendas()->whereNotNull('user_id')->count() === 0) {
            return redirect()->route('espacos.index')
                ->with('error', 'Este espaço ainda não possui um gestor definido.');
        }

        return Inertia::render('Espacos/VisualizarEspacoPage', $data);
    }

    /**
     * Add the specified space to the authenticated user's favorites.
     */
    public function favoritar(Espaco $espaco): RedirectResponse
    {
        $this->service->addFavorite(Auth::user(), $espaco);

        return redirect()->back()->with('success', 'Espaço adicionado aos favoritos!');
    }

    /**
     * Remove the specified space from the authenticated user's favorites.
     */
    public function desfavoritar(Espaco $espaco): RedirectResponse
    {
        $this->service->removeFavorite(Auth::user(), $espaco);

        return redirect()->back()->with('success', 'Espaço removido dos favoritos!');
    }

    /**
     * Display the authenticated user's favorited spaces.
     */
    public function meusFavoritos(): Response
    {
        $user = Auth::user();

        return Inertia::render('Espacos/FavoritosPage', [
            'favoritos' => $this->service->getFavoritedByUser($user, 10),
            'user' => ['permission_type_id' => $user->permission_type_id],
        ]);
    }
}
