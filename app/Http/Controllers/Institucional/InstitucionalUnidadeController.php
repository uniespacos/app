<?php

declare(strict_types=1);

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmPasswordRequest;
use App\Http\Requests\StoreUnidadeRequest;
use App\Http\Requests\UpdateUnidadeRequest;
use App\Models\Unidade;
use App\Services\UnidadeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InstitucionalUnidadeController extends Controller
{
    public function __construct(
        protected UnidadeService $service,
    ) {}

    /**
     * Display a paginated listing of units scoped to the authenticated user's institution.
     */
    public function index(): Response
    {
        $instituicaoId = Auth::user()->setor->unidade->instituicao_id;

        return Inertia::render('Administrativo/Unidades/Unidades', [
            'unidades' => $this->service->paginate($instituicaoId, 10),
        ]);
    }

    /**
     * Show the form for creating a new unit.
     */
    public function create(): Response
    {
        $user = Auth::user();

        return Inertia::render('Administrativo/Unidades/CadastrarUnidade', [
            'instituicao' => $user->setor->unidade->instituicao,
        ]);
    }

    /**
     * Store a newly created unit in storage.
     */
    public function store(StoreUnidadeRequest $request): RedirectResponse
    {
        try {
            $this->service->store($request->validated());

            return redirect()->route('institucional.unidades.index')
                ->with('success', 'Unidade criada com sucesso.');
        } catch (\Throwable $th) {
            return redirect()->route('institucional.unidades.index')
                ->with('error', 'Erro ao criar a unidade: '.$th->getMessage());
        }
    }

    /**
     * Show the form for editing the specified unit.
     */
    public function edit(Unidade $unidade): Response
    {
        $user = Auth::user();

        return Inertia::render('Administrativo/Unidades/EditarUnidade', [
            'instituicao' => $user->setor->unidade->instituicao,
            'unidade' => $unidade,
        ]);
    }

    /**
     * Update the specified unit in storage.
     */
    public function update(UpdateUnidadeRequest $request, Unidade $unidade): RedirectResponse
    {
        try {
            $this->service->update($unidade, $request->validated());

            return redirect()->route('institucional.unidades.index')
                ->with('success', 'Unidade atualizada com sucesso.');
        } catch (\Throwable $th) {
            return redirect()->route('institucional.unidades.index')
                ->with('error', 'Erro ao atualizar a unidade: '.$th->getMessage());
        }
    }

    /**
     * Remove the specified unit from storage.
     * Requires password confirmation from the authenticated user.
     */
    public function destroy(ConfirmPasswordRequest $request, Unidade $unidade): RedirectResponse
    {
        if (! $request->passwordMatches()) {
            return back()->with('error', 'A senha fornecida está incorreta.');
        }

        try {
            $this->service->delete($unidade);

            return back()->with('success', 'Unidade excluída com sucesso.');
        } catch (\Throwable $th) {
            return redirect()->route('institucional.unidades.index')
                ->with('error', 'Erro ao deletar a unidade: '.$th->getMessage());
        }
    }
}
