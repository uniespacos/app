<?php

declare(strict_types=1);

namespace App\Enums\Relatorio;

enum FormatoRelatorioEnum: string
{
    case PDF = 'pdf';
    case CSV = 'csv';
    case XLSX = 'xlsx';

    public function mimeType(): string
    {
        return match ($this) {
            self::PDF => 'application/pdf',
            self::CSV => 'text/csv; charset=UTF-8',
            self::XLSX => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
    }
}
