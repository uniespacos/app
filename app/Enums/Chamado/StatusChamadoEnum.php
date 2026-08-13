<?php

declare(strict_types=1);

namespace App\Enums\Chamado;

enum StatusChamadoEnum: string
{
    case ABERTO = 'aberto';
    case EM_ANDAMENTO = 'em_andamento';
    case RESOLVIDO = 'resolvido';
    case CANCELADO = 'cancelado';

    public function label(): string
    {
        return match ($this) {
            self::ABERTO => 'Aberto',
            self::EM_ANDAMENTO => 'Em Andamento',
            self::RESOLVIDO => 'Resolvido',
            self::CANCELADO => 'Cancelado',
        };
    }

    /**
     * Converte um valor cru do banco no rotulo legivel, sem quebrar
     * caso apareca um status desconhecido.
     */
    public static function labelDe(?string $valor): string
    {
        if ($valor === null) {
            return '—';
        }

        return self::tryFrom($valor)?->label() ?? $valor;
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
