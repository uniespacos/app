<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Agenda;
use App\Models\Instituicao;
use App\Models\Setor;
use App\Models\User;
use App\Notifications\UserAssignedAsManagerNotification;
use App\Notifications\UserRemovedAsManagerNotification;
use App\Repositories\PermissionRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Spatie\Permission\PermissionRegistrar;

class UserService
{
    public function __construct(
        protected UserRepositoryInterface $repoUser,
        protected PermissionRepositoryInterface $repoPermission,
    ) {}

    /**
     * Returns all users belonging to the given institution with their sector relation.
     *
     * @return Collection<int, User>
     */
    public function getAllByInstituicao(int $instituicaoId): Collection
    {
        return $this->repoUser->getAllByInstituicao($instituicaoId);
    }

    /**
     * Returns all data needed to render the admin users index page.
     *
     * @return array<string, mixed>
     */
    public function getIndexData(User $authUser, ?string $search = null, ?int $setorId = null): array
    {
        $instituicaoId = $authUser->setor->unidade->instituicao_id;

        $users = $this->repoUser->getPaginatedForAdminByInstituicao($instituicaoId, $search, $setorId);
        $users->through(fn (User $user) => array_merge($user->toArray(), [
            'roles' => $user->getRoleNames(),
        ]));
        $users->withQueryString();

        // Só o necessário para o <Select> de setores do filtro. Antes esta query
        // arrastava todos os usuários de cada setor com a cadeia completa de
        // agendas/espaços (~495KB de JSON por request) sem que a tela usasse nada
        // disso além de id e sigla.
        $setores = Setor::select(['id', 'sigla'])->orderBy('sigla')->get();

        return [
            'users' => $users,
            'setores' => $setores,
            'filters' => ['search' => $search, 'setor_id' => $setorId],
        ];
    }

    /**
     * Returns everything the permission modal needs for a single user.
     *
     * Fica fora do index de propósito: a árvore de instituições e as agendas do
     * usuário só fazem sentido quando o modal de permissões abre, e carregá-las
     * na listagem custava segundos por request.
     *
     * @return array<string, mixed>
     */
    public function getPermissionContext(User $user): array
    {
        $user = $this->repoUser->getWithPermissionContext($user->id);

        return [
            'user' => array_merge($user->toArray(), [
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'direct_permissions' => $user->getDirectPermissions()->pluck('name'),
            ]),
            // Só as colunas que o seletor em cascata desenha. Trazer a linha
            // inteira de espaco (descricao, imagens, main_image_index) inflava
            // esta árvore em várias vezes sem que a tela usasse nada disso.
            'instituicoes' => Instituicao::select(['id', 'nome', 'sigla'])
                ->with([
                    'unidades:id,nome,instituicao_id',
                    'unidades.modulos:id,nome,unidade_id',
                    'unidades.modulos.andars:id,nome,modulo_id',
                    'unidades.modulos.andars.espacos:id,nome,capacidade_pessoas,andar_id',
                    'unidades.modulos.andars.espacos.agendas:id,turno,espaco_id',
                ])
                ->get(),
            'permissionCatalog' => $this->repoPermission->getAllGroupedByPrefix(),
        ];
    }

    /**
     * Sends the email verification notification to the given user, for an admin to trigger on their behalf.
     */
    public function resendVerificationEmail(User $user): void
    {
        if ($user->hasVerifiedEmail()) {
            throw new \RuntimeException('Este e-mail já está verificado.');
        }

        $user->sendEmailVerificationNotification();
    }

    /**
     * Sends a password reset link to the given user's email, for an admin to trigger on their behalf.
     */
    public function sendPasswordResetLink(User $user): bool
    {
        return Password::sendResetLink(['email' => $user->email]) === Password::RESET_LINK_SENT;
    }

    /**
     * Updates the permission type and agenda assignments for a user.
     * Notifies the user based on whether they were assigned or removed as a manager.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePermissions(User $user, array $data): void
    {
        $newRole = $data['role_name'];
        $agendaIds = $data['agendas'] ?? [];

        DB::transaction(function () use ($user, $newRole, $agendaIds, $data) {
            $user->syncRoles([$newRole]);

            if (array_key_exists('direct_permissions', $data)) {
                $user->syncPermissions($data['direct_permissions']);
            }

            if ($newRole === 'gestor') {
                $currentAgendaIds = Agenda::where('user_id', $user->id)->pluck('id')->toArray();

                $toUnlink = array_diff($currentAgendaIds, $agendaIds);
                if (! empty($toUnlink)) {
                    Agenda::whereIn('id', $toUnlink)->update(['user_id' => null]);
                }

                if (! empty($agendaIds)) {
                    Agenda::whereIn('id', $agendaIds)->update(['user_id' => $user->id]);
                }

                try {
                    $user->notify(new UserAssignedAsManagerNotification($user));
                } catch (\Exception $e) {
                    Log::warning('Falha ao notificar usuário sobre atribuição como gestor', [
                        'user_id' => $user->id,
                        'exception' => $e,
                    ]);
                }
            } else {
                Agenda::where('user_id', $user->id)->update(['user_id' => null]);

                try {
                    $user->notify(new UserRemovedAsManagerNotification($user));
                } catch (\Exception $e) {
                    Log::warning('Falha ao notificar usuário sobre remoção como gestor', [
                        'user_id' => $user->id,
                        'exception' => $e,
                    ]);
                }
            }

            app(PermissionRegistrar::class)->forgetCachedPermissions();
        });
    }

    /**
     * Deletes the given user from the database.
     */
    public function delete(User $user): bool
    {
        return $this->repoUser->destroy($user->id);
    }
}
