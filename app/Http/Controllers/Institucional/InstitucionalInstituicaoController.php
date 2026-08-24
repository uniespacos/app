<?php

declare(strict_types=1);

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmPasswordRequest;
use App\Http\Requests\ListarInstituicoesRequest;
use App\Http\Requests\StoreInstituicaoRequest;
use App\Http\Requests\UpdateInstituicaoRequest;
use App\Models\Instituicao;
use App\Services\InstituicaoService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InstitucionalInstituicaoController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected InstituicaoService $service,
    ) {}

    /**
     * Display a paginated listing of institutions.
     */
    public function index(ListarInstituicoesRequest $request): Response
    {
        $this->authorize('viewAny', Instituicao::class);

        $validated = $request->validated();
        $search = $validated['search'] ?? null;
        $instituicoes = $this->service->paginate(10, $search);
        $instituicoes->withQueryString();

        return Inertia::render('Administrativo/Instituicoes/Instituicoes', [
            'instituicoes' => $instituicoes,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show the form for creating a new institution.
     */
    public function create(): Response
    {
        return Inertia::render('Administrativo/Instituicoes/CadastrarInstituicao');
    }

    /**
     * Store a newly created institution in storage.
     */
    public function store(StoreInstituicaoRequest $request): RedirectResponse
    {
        $this->authorize('create', Instituicao::class);

        $this->service->store($request->validated());

        return redirect()->route('institucional.instituicoes.index')
            ->with('success', 'Instituição criada com sucesso.');
    }

    /**
     * Show the form for editing the specified institution.
     */
    public function edit(Instituicao $instituico): Response
    {
        return Inertia::render('Administrativo/Instituicoes/EditarInstituicao', [
            'instituicao' => $instituico,
        ]);
    }

    /**
     * Update the specified institution in storage.
     */
    public function update(UpdateInstituicaoRequest $request, Instituicao $instituico): RedirectResponse
    {
        $this->authorize('update', $instituico);

        try {
            $this->service->update($instituico, $request->validated());

            return redirect()->route('institucional.instituicoes.index')
                ->with('success', 'Instituição atualizada com sucesso.');
        } catch (\Throwable $th) {
            return back()->withInput()->with('error', 'Erro ao atualizar a instituição: '.$th->getMessage());
        }
    }

    /**
     * Remove the specified institution from storage.
     * Requires password confirmation from the authenticated user.
     */
    public function destroy(ConfirmPasswordRequest $request, Instituicao $instituico): RedirectResponse
    {
        $this->authorize('delete', $instituico);

        if (! $request->passwordMatches()) {
            return back()->with('error', 'A senha fornecida está incorreta.');
        }

        $this->service->delete($instituico);

        return back()->with('success', 'Instituição excluída com sucesso.');
    }
}
