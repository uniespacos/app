<?php

declare(strict_types=1);

namespace App\Enums\Chamado;

enum TipoChamadoEnum: string
{
    case DEFEITO = 'defeito';
    case RECLAMACAO = 'reclamacao';
    case SUGESTAO = 'sugestao';

    public function label(): string
    {
        return match ($this) {
            self::DEFEITO => 'Defeito',
            self::RECLAMACAO => 'Reclamação',
            self::SUGESTAO => 'Sugestão',
        };
    }

    /**
     * Converte um valor cru do banco no rotulo legivel, sem quebrar
     * caso apareca um tipo desconhecido.
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
