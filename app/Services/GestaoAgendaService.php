<?php

namespace App\Services;

use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\User;
use App\Notifications\UserAssignedAsManagerNotification;
use App\Notifications\UserRemovedAsManagerNotification;
use Illuminate\Support\Facades\DB;

class GestaoAgendaService
{
    // Definindo as permissões como constantes para clareza
    const INSTITUCIONAL_PERMISSION_ID = 1;

    const GESTOR_PERMISSION_ID = 2;

    const COMUM_PERMISSION_ID = 3;

    /**
     * Atualiza as permissões de um usuário e gerencia suas agendas.
     * Chamado a partir do UserController.
     */
    public function updateUserPermissionsAndAgendas(User $user, array $validatedData): void
    {
        $permissionTypeId = (int) $validatedData['permission_type_id'];
        $agendaIds = $validatedData['agendas'] ?? [];

        if ($permissionTypeId === self::GESTOR_PERMISSION_ID) {
            DB::transaction(function () use ($user, $permissionTypeId, $agendaIds) {
                // 1. Atualiza o tipo de permissão do usuário
                $user->permission_type_id = $permissionTypeId;
                $user->save();

                // Pega todas as agendas que *atualmente* pertencem a este usuário
                $currentAgendas = Agenda::where('user_id', $user->id)->get();
                $currentAgendaIds = $currentAgendas->pluck('id')->toArray();

                // 2. Desvincula as agendas que não estão mais na lista
                $agendasToUnlink = array_diff($currentAgendaIds, $agendaIds);
                if (! empty($agendasToUnlink)) {
                    Agenda::whereIn('id', $agendasToUnlink)->update(['user_id' => null]);
                }

                // 3. Vincula as novas agendas ao usuário
                if (! empty($agendaIds)) {
                    Agenda::whereIn('id', $agendaIds)->update(['user_id' => $user->id]);
                }
                $user->notify(new UserAssignedAsManagerNotification($user));
            });
        } else {
            // 4. Se a permissão for de Administrador ou outra que não gerencia agendas,
            // garante que ele não tenha nenhuma agenda vinculada.
            if ($permissionTypeId == 1 || $permissionTypeId == 3) { // Ex: Admin, etc.
                Agenda::where('user_id', $user->id)->update(['user_id' => null]);
                $user->notify(new UserRemovedAsManagerNotification($user));
            }
        }
    }

    /**
     * Altera os gestores de um espaço e atualiza suas permissões.
     * Chamado a partir do EspacoController.
     */
    public function updateEspacoGestores(Espaco $espaco, array $validatedData): void
    {
        $gestoresPorTurno = $validatedData['gestores'];

        DB::transaction(function () use ($espaco, $gestoresPorTurno) {
            foreach ($gestoresPorTurno as $turno => $userId) {
                $agenda = $espaco->agendas()->where('turno', $turno)->first();

                if (! $agenda) {
                    continue; // Pula se não encontrar a agenda para o turno
                }

                $oldUserId = $agenda->user_id;

                // Se não houve mudança, pula para o próximo
                if ($oldUserId == $userId) {
                    continue;
                }

                // 1. Atualiza o gestor da agenda (vincula/desvincula)
                $agenda->update(['user_id' => $userId]);

                // 2. Atualiza a permissão do novo gestor, se houver um novo
                if ($userId) {
                    $newUser = User::find($userId);
                    if ($newUser && $newUser->permission_type_id != self::GESTOR_PERMISSION_ID) {
                        $newUser->permission_type_id = self::GESTOR_PERMISSION_ID;
                        $newUser->save();
                        $newUser->notify(new UserAssignedAsManagerNotification($newUser, $espaco->nome, $turno));
                    }
                }

                // 3. Verifica se o antigo gestor ainda gerencia outras agendas.
                // Se não, podemos alterar sua permissão (ex: para um tipo padrão) ou deixá-la como está.
                // Esta parte depende da regra de negócio. Uma abordagem segura é não rebaixar a permissão
                // automaticamente, pois ele pode ser gestor de outros espaços.
                if ($oldUserId) {
                    $oldUser = User::find($oldUserId);
                    if ($oldUser && ! Agenda::where('user_id', $oldUserId)->exists()) {
                        $oldUser->permission_type_id = 3; // Ex: Rebaixar para tipo padrão
                        $oldUser->save();
                        $oldUser->notify(new UserRemovedAsManagerNotification($oldUser, $espaco->nome, $turno));
                    }
                }
            }
        });
    }
}
