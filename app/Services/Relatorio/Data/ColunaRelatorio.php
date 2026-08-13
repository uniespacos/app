<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Data;

final readonly class ColunaRelatorio
{
    public function __construct(
        public string $chave,
        public string $rotulo,
        public string $tipo = 'string',
        public int $largura = 20,
    ) {}
}
