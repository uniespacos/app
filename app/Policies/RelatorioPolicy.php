<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

class RelatorioPolicy
{
    /**
     * Determina se o usuário pode acessar relatórios (verificação genérica de permissão).
     * A validação de tipo específico ocorre em RelatorioService::agregar().
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyPermission([
            'relatorios.reservas-periodo',
            'relatorios.ocupacao-espacos',
            'relatorios.inventario-espacos',
            'relatorios.indicadores-consolidados',
            'secao.relatorios',
        ]);
    }

    /**
     * Retorna os filtros de escopo aplicáveis ao usuário baseado em suas permissões.
     *
     * @return array{
     *     tipo: 'institucional'|'gestor',
     *     instituicaoId: int|null,
     *     unidadeId: int|null,
     *     agendaIds: array<int>,
     * }|array{}
     */
    public function aplicarEscopoParaUsuario(User $user): array
    {
        // Institucional: acesso a todas as agendas de sua instituição
        if ($user->can('relatorios.escopo-instituicao') || $user->can('secao.dashboard-institucional')) {
            return [
                'tipo' => 'institucional',
                'instituicaoId' => $user->setor?->unidade?->instituicao_id,
                'unidadeId' => null,
                'agendaIds' => [],
            ];
        }

        // Gestor: acesso apenas a suas agendas gerenciadas
        if ($user->can('relatorios.escopo-agendas') || $user->can('secao.dashboard-gestor') || $user->can('reservas.avaliar')) {
            return [
                'tipo' => 'gestor',
                'instituicaoId' => null,
                'unidadeId' => null,
                'agendaIds' => $user->agendas()->pluck('id')->all(),
            ];
        }

        // Fallback: acesso negado
        return [];
    }
}
