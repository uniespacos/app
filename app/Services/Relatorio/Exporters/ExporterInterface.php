<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Exporters;

use App\Enums\Relatorio\FormatoRelatorioEnum;
use App\Services\Relatorio\Data\DadosRelatorio;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

interface ExporterInterface
{
    public function suporta(FormatoRelatorioEnum $formato): bool;

    public function exportar(DadosRelatorio $dados, string $nomeArquivo): BinaryFileResponse|StreamedResponse;
}
