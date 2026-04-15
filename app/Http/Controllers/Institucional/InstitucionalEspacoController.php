<?php

declare(strict_types=1);

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Http\Requests\AlterarGestoresEspacoRequest;
use App\Http\Requests\ConfirmPasswordRequest;
use App\Http\Requests\StoreEspacoRequest;
use App\Http\Requests\UpdateEspacoRequest;
use App\Models\Espaco;
use App\Services\EspacoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class InstitucionalEspacoController extends Controller
{
    public function __construct(
        protected EspacoService $service,
    ) {}

    /**
     * Display the admin listing of spaces with managers and structural data.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $instituicaoId = $user->setor->unidade->instituicao_id;
        $formData = $this->service->getFormData($instituicaoId);

        return Inertia::render('Administrativo/Espacos/GerenciarEspacos', [
            'espacos' => $this->service->getAdminListing($instituicaoId),
            'andares' => $formData['andares'],
            'modulos' => $formData['modulos'],
            'unidades' => $formData['unidades'],
            'users' => $this->service->getUsersWithAgendas($instituicaoId),
        ]);
    }

    /**
     * Show the form for creating a new space.
     */
    public function create(): Response
    {
        $instituicaoId = Auth::user()->setor->unidade->instituicao_id;
        $formData = $this->service->getFormData($instituicaoId);

        return Inertia::render('Administrativo/Espacos/CadastroEspaco', $formData);
    }

    /**
     * Store a newly created space with images and shift agendas in storage.
     */
    public function store(StoreEspacoRequest $request): RedirectResponse
    {
        try {
            $this->service->store(
                $request->validated(),
                $request->file('imagens', [])
            );

            return redirect()->route('institucional.espacos.index')
                ->with('success', 'Espaço cadastrado com sucesso!');
        } catch (\Exception $e) {
            Log::error('Erro ao criar espaço: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Ocorreu um erro inesperado ao criar o espaço.')
                ->withInput();
        }
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

    /**
     * Show the form for editing the specified space.
     */
    public function edit(Espaco $espaco): Response
    {
        $espaco->load('andar.modulo.unidade');
        $instituicaoId = Auth::user()->setor->unidade->instituicao_id;
        $formData = $this->service->getFormData($instituicaoId);

        return Inertia::render('Administrativo/Espacos/CadastroEspaco', array_merge(
            $formData,
            ['espaco' => $espaco]
        ));
    }

    /**
     * Update the specified space in storage, managing image changes.
     */
    public function update(UpdateEspacoRequest $request, Espaco $espaco): RedirectResponse
    {
        try {
            $this->service->update(
                $espaco,
                $request->validated(),
                $request->file('imagens', []),
                $request->validated('images_to_delete', [])
            );

            return redirect()->route('institucional.espacos.index')
                ->with('success', 'Espaço atualizado com sucesso!');
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar espaço: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Ocorreu um erro inesperado ao atualizar o espaço.')
                ->withInput();
        }
    }

    /**
     * Remove the specified space from storage.
     * Requires password confirmation from the authenticated user.
     */
    public function destroy(ConfirmPasswordRequest $request, Espaco $espaco): RedirectResponse
    {
        if (! $request->passwordMatches()) {
            return back()->with('error', 'A senha fornecida está incorreta.');
        }

        try {
            $this->service->delete($espaco);

            return redirect()->route('institucional.espacos.index')
                ->with('success', 'Espaço excluído com sucesso!');
        } catch (\Exception $error) {
            return redirect()->back()->with('error', 'Erro ao excluir, favor tentar novamente.');
        }
    }

    /**
     * Update the shift managers for the specified space.
     */
    public function alterarGestores(AlterarGestoresEspacoRequest $request, Espaco $espaco): RedirectResponse
    {
        try {
            $this->service->updateGestores($espaco, $request->validated());

            return redirect()->route('institucional.espacos.index')
                ->with('success', 'Gestores atualizados com sucesso!');
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar gestores do espaço: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar os gestores do espaço.');
        }
    }
}
