<?php

declare(strict_types=1);

namespace App\Enums\Relatorio;

use App\Models\User;

enum TipoRelatorioEnum: string
{
    case RESERVAS_PERIODO = 'reservas_periodo';
    case OCUPACAO_ESPACOS = 'ocupacao_espacos';
    case INVENTARIO_ESPACOS = 'inventario_espacos';
    case INDICADORES_CONSOLIDADOS = 'indicadores_consolidados';

    public function titulo(): string
    {
        return match ($this) {
            self::RESERVAS_PERIODO => 'Relatório de Reservas por Período',
            self::OCUPACAO_ESPACOS => 'Relatório de Ocupação de Espaços',
            self::INVENTARIO_ESPACOS => 'Inventário de Espaços',
            self::INDICADORES_CONSOLIDADOS => 'Indicadores Consolidados',
        };
    }

    /**
     * Titulo sem o prefixo "Relatorio de", para uso dentro da tela de
     * relatorios, onde o contexto ja esta dado pelas abas.
     */
    public function tituloCurto(): string
    {
        return match ($this) {
            self::RESERVAS_PERIODO => 'Reservas por Período',
            self::OCUPACAO_ESPACOS => 'Ocupação de Espaços',
            self::INVENTARIO_ESPACOS => 'Inventário de Espaços',
            self::INDICADORES_CONSOLIDADOS => 'Indicadores Consolidados',
        };
    }

    public function permissao(): string
    {
        return match ($this) {
            self::RESERVAS_PERIODO => 'relatorios.reservas-periodo',
            self::OCUPACAO_ESPACOS => 'relatorios.ocupacao-espacos',
            self::INVENTARIO_ESPACOS => 'relatorios.inventario-espacos',
            self::INDICADORES_CONSOLIDADOS => 'relatorios.indicadores-consolidados',
        };
    }

    /**
     * @return array<int, self>
     */
    public static function disponiveisPara(User $user): array
    {
        return array_values(array_filter(
            self::cases(),
            fn (self $tipo): bool => $user->hasPermissionTo($tipo->permissao())
        ));
    }
}
