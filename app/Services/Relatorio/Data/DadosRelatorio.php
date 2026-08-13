<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Data;

use App\Enums\Relatorio\TipoRelatorioEnum;
use Carbon\CarbonImmutable;

final readonly class DadosRelatorio
{
    public function __construct(
        public TipoRelatorioEnum $tipo,
        public string $titulo,
        public string $subtitulo,
        public array $colunas,
        public array $linhas,
        public array $sumario,
        public array $filtrosAplicados,
        public string $geradoPor,
        public CarbonImmutable $geradoEm,
    ) {}

    public function totalLinhas(): int
    {
        return count($this->linhas);
    }
}
