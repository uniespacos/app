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
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class InstitucionalUsuarioController extends Controller
{
    public function __construct(
        protected UserService $service,
    ) {}

    /**
     * Display the users listing with permission types, institutions, and sectors.
     */
    public function index(): Response
    {
        $data = $this->service->getIndexData(Auth::user());

        return Inertia::render('Administrativo/Usuarios/Usuarios', $data);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = ['admin', 'gestor', 'user'];
        $statuses = ['active', 'inactive', 'suspended'];

        return Inertia::render('Editar/UserController', [
            'roles' => $roles,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        return redirect()->route('institucional.usuarios.index')
            ->with('success', 'Usuário criado com sucesso.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $usuario): Response
    {
        return Inertia::render('Editar/UserDetail', [
            'user' => $usuario,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $usuario): Response
    {
        $roles = ['admin', 'gestor', 'user'];
        $statuses = ['active', 'inactive', 'suspended'];

        return Inertia::render('Editar/UserController', [
            'user' => $usuario,
            'roles' => $roles,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $usuario): RedirectResponse
    {
        $usuario->update($request->validated());

        return redirect()->route('institucional.usuarios.index')
            ->with('success', 'Usuário atualizado com sucesso.');
    }

    /**
     * Update the permission type and agenda assignments for the given user.
     */
    public function updatePermissions(UpdatePermissionsRequest $request, User $user): RedirectResponse
    {
        try {
            $this->service->updatePermissions($user, $request->validated());

            return redirect()->route('institucional.usuarios.index')
                ->with('success', 'Permissões atualizadas com sucesso.');
        } catch (\Exception $e) {
            Log::error("Erro ao atualizar permissões do usuário {$user->id}: ".$e->getMessage());

            return redirect()->route('institucional.usuarios.index')
                ->with('error', 'Erro ao atualizar permissões: '.$e->getMessage());
        }
    }

    /**
     * Delete the specified user from storage after password confirmation.
     */
    public function destroy(ConfirmPasswordRequest $request, User $usuario): RedirectResponse
    {
        if (! $request->passwordMatches()) {
            return back()->with('error', 'A senha fornecida está incorreta.');
        }

        try {
            $this->service->delete($usuario);

            return redirect()->route('institucional.usuarios.index')
                ->with('success', 'Usuário excluído com sucesso.');
        } catch (\Exception $e) {
            Log::error("Erro ao excluir usuário {$usuario->id}: ".$e->getMessage());

            return redirect()->route('institucional.usuarios.index')
                ->with('error', 'Erro ao excluir usuário.');
        }
    }
}
