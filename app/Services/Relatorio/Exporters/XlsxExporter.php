<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Exporters;

use App\Enums\Relatorio\FormatoRelatorioEnum;
use App\Services\Relatorio\Data\DadosRelatorio;
use App\Services\Relatorio\Exports\RelatorioExport;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

final class XlsxExporter implements ExporterInterface
{
    public function suporta(FormatoRelatorioEnum $formato): bool
    {
        return $formato === FormatoRelatorioEnum::XLSX;
    }

    public function exportar(DadosRelatorio $dados, string $nomeArquivo): BinaryFileResponse
    {
        return Excel::download(new RelatorioExport($dados), $nomeArquivo, \Maatwebsite\Excel\Excel::XLSX);
    }
}
