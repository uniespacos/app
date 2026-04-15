<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Agenda;
use App\Models\Instituicao;
use App\Models\PermissionType;
use App\Models\Setor;
use App\Models\User;
use App\Notifications\UserAssignedAsManagerNotification;
use App\Notifications\UserRemovedAsManagerNotification;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserService
{
    private const GESTOR_PERMISSION_ID = 2;

    public function __construct(
        protected UserRepositoryInterface $repoUser,
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
    public function getIndexData(User $authUser): array
    {
        $instituicaoId = $authUser->setor->unidade->instituicao_id;

        $users = $this->repoUser->getAllForAdminByInstituicao($instituicaoId);

        $permissionTypes = PermissionType::all()->map(fn ($type) => [
            'id' => $type->id,
            'nome' => $type->nome,
            'label' => $type->nome,
        ]);

        $instituicoes = Instituicao::with(['unidades.modulos.andars.espacos.agendas'])->get();

        $setores = Setor::with([
            'unidade.instituicao',
            'users.agendas.espaco.andar.modulo.unidade.instituicao',
        ])->get();

        return [
            'users' => $users,
            'permissionTypes' => $permissionTypes,
            'instituicoes' => $instituicoes,
            'setores' => $setores,
        ];
    }

    /**
     * Updates the permission type and agenda assignments for a user.
     * Notifies the user based on whether they were assigned or removed as a manager.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePermissions(User $user, array $data): void
    {
        $permissionTypeId = (int) $data['permission_type_id'];
        $agendaIds = $data['agendas'] ?? [];

        DB::transaction(function () use ($user, $permissionTypeId, $agendaIds) {
            $user->permission_type_id = $permissionTypeId;
            $user->save();

            if ($permissionTypeId === self::GESTOR_PERMISSION_ID) {
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
                    Log::warning("Failed to notify user {$user->id} of manager assignment: ".$e->getMessage());
                }
            } else {
                Agenda::where('user_id', $user->id)->update(['user_id' => null]);

                try {
                    $user->notify(new UserRemovedAsManagerNotification($user));
                } catch (\Exception $e) {
                    Log::warning("Failed to notify user {$user->id} of manager removal: ".$e->getMessage());
                }
            }
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
