<?php

declare(strict_types=1);

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmPasswordRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdatePermissionsRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class InstitucionalUsuarioController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected UserService $service,
    ) {}

    /**
     * Display the users listing with permission types, institutions, and sectors.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', User::class);

        $data = $this->service->getIndexData(Auth::user());

        return Inertia::render('Administrativo/Usuarios/Usuarios', $data);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        User::create($request->validated());

        return redirect()->route('institucional.usuarios.index')
            ->with('success', 'Usuário criado com sucesso.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $usuario): RedirectResponse
    {
        $this->authorize('update', $usuario);

        $usuario->update($request->validated());

        return redirect()->route('institucional.usuarios.index')
            ->with('success', 'Usuário atualizado com sucesso.');
    }

    /**
     * Update the permission type and agenda assignments for the given user.
     */
    public function updatePermissions(UpdatePermissionsRequest $request, User $user): RedirectResponse
    {
        $this->authorize('updatePermissions', $user);

        try {
            $this->service->updatePermissions($user, $request->validated());

            return redirect()->route('institucional.usuarios.index')
                ->with('success', 'Permissões atualizadas com sucesso.');
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar permissões do usuário', [
                'usuario_alvo_id' => $user->id,
                'exception' => $e,
            ]);

            return redirect()->route('institucional.usuarios.index')
                ->with('error', 'Erro ao atualizar permissões: '.$e->getMessage());
        }
    }

    /**
     * Delete the specified user from storage after password confirmation.
     */
    public function destroy(ConfirmPasswordRequest $request, User $usuario): RedirectResponse
    {
        $this->authorize('delete', $usuario);

        if (! $request->passwordMatches()) {
            return back()->with('error', 'A senha fornecida está incorreta.');
        }

        try {
            $this->service->delete($usuario);

            return redirect()->route('institucional.usuarios.index')
                ->with('success', 'Usuário excluído com sucesso.');
        } catch (\Exception $e) {
            Log::error('Erro ao excluir usuário', [
                'usuario_alvo_id' => $usuario->id,
                'exception' => $e,
            ]);

            return redirect()->route('institucional.usuarios.index')
                ->with('error', 'Erro ao excluir usuário.');
        }
    }
}
