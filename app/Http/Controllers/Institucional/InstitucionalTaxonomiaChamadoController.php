<?php

declare(strict_types=1);

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoriaChamadoRequest;
use App\Http\Requests\StoreTipoChamadoRequest;
use App\Http\Requests\UpdateCategoriaChamadoRequest;
use App\Http\Requests\UpdateTipoChamadoRequest;
use App\Models\CategoriaChamado;
use App\Models\TipoChamado;
use App\Services\TaxonomiaChamadoService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InstitucionalTaxonomiaChamadoController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected TaxonomiaChamadoService $service,
    ) {}

    /**
     * Tela unica com as duas taxonomias em abas.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', TipoChamado::class);

        return Inertia::render('Administrativo/TaxonomiasChamado/TaxonomiasChamado', [
            'tipos' => $this->service->getTipos(),
            'categorias' => $this->service->getCategorias(),
        ]);
    }

    public function storeTipo(StoreTipoChamadoRequest $request): RedirectResponse
    {
        $this->authorize('create', TipoChamado::class);

        try {
            $this->service->storeTipo($request->validated());

            return redirect()->route('institucional.taxonomias-chamado.index')
                ->with('success', 'Tipo cadastrado com sucesso!');
        } catch (\Exception $e) {
            return back()->with(['error' => 'Erro ao cadastrar tipo: '.$e->getMessage()])->withInput();
        }
    }

    public function updateTipo(UpdateTipoChamadoRequest $request, TipoChamado $tipo): RedirectResponse
    {
        $this->authorize('update', $tipo);

        try {
            $this->service->updateTipo($tipo, $request->validated());

            return redirect()->route('institucional.taxonomias-chamado.index')
                ->with('success', 'Tipo atualizado com sucesso!');
        } catch (\Exception $e) {
            return back()->with(['error' => 'Erro ao atualizar tipo: '.$e->getMessage()])->withInput();
        }
    }

    /**
     * Exclusao e soft delete: o tipo sai dos formularios novos, mas segue rotulando o historico.
     */
    public function destroyTipo(TipoChamado $tipo): RedirectResponse
    {
        $this->authorize('delete', $tipo);

        try {
            $this->service->deleteTipo($tipo);

            return redirect()->route('institucional.taxonomias-chamado.index')
                ->with('success', 'Tipo removido com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erro ao remover tipo: '.$e->getMessage()]);
        }
    }

    public function storeCategoria(StoreCategoriaChamadoRequest $request): RedirectResponse
    {
        $this->authorize('create', CategoriaChamado::class);

        try {
            $this->service->storeCategoria($request->validated());

            return redirect()->route('institucional.taxonomias-chamado.index')
                ->with('success', 'Categoria cadastrada com sucesso!');
        } catch (\Exception $e) {
            return back()->with(['error' => 'Erro ao cadastrar categoria: '.$e->getMessage()])->withInput();
        }
    }

    public function updateCategoria(UpdateCategoriaChamadoRequest $request, CategoriaChamado $categoria): RedirectResponse
    {
        $this->authorize('update', $categoria);

        try {
            $this->service->updateCategoria($categoria, $request->validated());

            return redirect()->route('institucional.taxonomias-chamado.index')
                ->with('success', 'Categoria atualizada com sucesso!');
        } catch (\Exception $e) {
            return back()->with(['error' => 'Erro ao atualizar categoria: '.$e->getMessage()])->withInput();
        }
    }

    /**
     * Exclusao e soft delete: a categoria sai dos formularios novos, mas segue rotulando o historico.
     */
    public function destroyCategoria(CategoriaChamado $categoria): RedirectResponse
    {
        $this->authorize('delete', $categoria);

        try {
            $this->service->deleteCategoria($categoria);

            return redirect()->route('institucional.taxonomias-chamado.index')
                ->with('success', 'Categoria removida com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erro ao remover categoria: '.$e->getMessage()]);
        }
    }
}
