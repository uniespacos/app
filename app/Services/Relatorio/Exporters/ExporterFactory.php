<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Exporters;

use App\Enums\Relatorio\FormatoRelatorioEnum;
use RuntimeException;

final class ExporterFactory
{
    public function __construct(
        private iterable $exporters,
    ) {}

    public function make(FormatoRelatorioEnum $formato): ExporterInterface
    {
        foreach ($this->exporters as $exporter) {
            if ($exporter->suporta($formato)) {
                return $exporter;
            }
        }

        throw new RuntimeException("Formato não suportado: {$formato->value}");
    }
}
