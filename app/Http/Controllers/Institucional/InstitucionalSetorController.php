<?php

declare(strict_types=1);

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmPasswordRequest;
use App\Http\Requests\StoreSetorRequest;
use App\Http\Requests\UpdateSetorRequest;
use App\Models\Setor;
use App\Services\SetorService;
use App\Services\UnidadeService;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InstitucionalSetorController extends Controller
{
    public function __construct(
        protected SetorService $service,
        protected UnidadeService $unidadeService,
        protected UserService $userService,
    ) {}

    /**
     * Display a listing of sectors with related institution, units and users.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $instituicao = $user->setor->unidade->instituicao->load(['unidades']);
        $instituicaoId = $instituicao->id;

        return Inertia::render('Administrativo/Setores/Setores', [
            'instituicao' => $instituicao,
            'unidades' => $this->unidadeService->getAllByInstituicao($instituicaoId)->load(['setors']),
            'setores' => $this->service->getAllByInstituicao($instituicaoId),
            'usuarios' => $this->userService->getAllByInstituicao($instituicaoId),
        ]);
    }

    /**
     * Redirect to the sector panel — sectors are managed inline, not via a separate create page.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('institucional.setors.index')
            ->with('error', 'A criação de setores é a partir do painel administrativo de setores.');
    }

    /**
     * Store a newly created sector in storage.
     */
    public function store(StoreSetorRequest $request): RedirectResponse
    {
        try {
            $this->service->store($request->validated());

            return redirect()->route('institucional.setors.index')
                ->with('success', 'Setor cadastrado com sucesso!');
        } catch (\Exception $e) {
            return back()->with(['error' => 'Erro ao cadastrar setor: '.$e->getMessage()])->withInput();
        }
    }

    /**
     * Redirect to the sector panel — sectors are edited inline.
     */
    public function edit(Setor $setor): RedirectResponse
    {
        return redirect()->route('institucional.setors.index')
            ->with('error', 'A edição de setores é a partir do painel administrativo de setores.');
    }

    /**
     * Update the specified sector in storage and notify its users.
     */
    public function update(UpdateSetorRequest $request, Setor $setor): RedirectResponse
    {
        try {
            $this->service->update($setor, $request->validated());

            return redirect()->route('institucional.setors.index')
                ->with('success', 'Setor atualizado com sucesso!');
        } catch (\Exception $e) {
            return back()->with(['error' => 'Erro ao atualizar setor: '.$e->getMessage()])->withInput();
        }
    }

    /**
     * Remove the specified sector from storage.
     * Requires password confirmation from the authenticated user.
     */
    public function destroy(ConfirmPasswordRequest $request, Setor $setor): RedirectResponse
    {
        if (! $request->passwordMatches()) {
            return back()->with('error', 'A senha fornecida está incorreta.');
        }

        try {
            $this->service->delete($setor);

            return redirect()->route('institucional.setors.index')
                ->with('success', 'Setor removido com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erro ao remover setor: '.$e->getMessage()]);
        }
    }
}
