<?php

declare(strict_types=1);

namespace App\Enums\Chamado;

enum CategoriaChamadoEnum: string
{
    case ELETRICA = 'eletrica';
    case HIDRAULICA = 'hidraulica';
    case MOBILIARIO = 'mobiliario';
    case TI = 'ti';
    case LIMPEZA = 'limpeza';
    case OUTROS = 'outros';

    public function label(): string
    {
        return match ($this) {
            self::ELETRICA => 'Elétrica',
            self::HIDRAULICA => 'Hidráulica',
            self::MOBILIARIO => 'Mobiliário',
            self::TI => 'Informática',
            self::LIMPEZA => 'Limpeza',
            self::OUTROS => 'Outros',
        };
    }

    /**
     * Descricao de apoio exibida ao reportante anonimo, que nao conhece
     * o vocabulario interno da gestao.
     */
    public function descricao(): string
    {
        return match ($this) {
            self::ELETRICA => 'Lâmpada, tomada, ar-condicionado',
            self::HIDRAULICA => 'Torneira, vazamento, descarga',
            self::MOBILIARIO => 'Carteira, mesa, cadeira, porta',
            self::TI => 'Computador, projetor, rede',
            self::LIMPEZA => 'Sala suja, lixo acumulado',
            self::OUTROS => 'Outro tipo de problema',
        };
    }

    /**
     * Converte um valor cru do banco no rotulo legivel, sem quebrar
     * caso apareca uma categoria desconhecida.
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

    /**
     * Lista pronta para alimentar o select do formulario publico.
     *
     * @return list<array{value: string, label: string, descricao: string}>
     */
    public static function paraSelect(): array
    {
        return array_map(fn (self $caso): array => [
            'value' => $caso->value,
            'label' => $caso->label(),
            'descricao' => $caso->descricao(),
        ], self::cases());
    }
}
