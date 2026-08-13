<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Exports;

use App\Services\Relatorio\Data\DadosRelatorio;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

final class RelatorioExport implements FromArray, WithColumnFormatting, WithHeadings, WithMapping, WithStyles, WithTitle
{
    public function __construct(
        private DadosRelatorio $dados,
    ) {}

    public function array(): array
    {
        return $this->dados->linhas;
    }

    public function headings(): array
    {
        return array_map(fn ($coluna) => $coluna->rotulo, $this->dados->colunas);
    }

    public function map($linha): array
    {
        return array_map(fn ($coluna) => $linha[$coluna->chave] ?? '', $this->dados->colunas);
    }

    public function columnFormats(): array
    {
        $formats = [];

        foreach ($this->dados->colunas as $index => $coluna) {
            $columnLetter = $this->columnIndexToLetter($index);

            $formats[$columnLetter] = match ($coluna->tipo) {
                'date' => NumberFormat::FORMAT_DATE_DDMMYYYY,
                'datetime' => NumberFormat::FORMAT_DATE_DATETIME,
                'integer' => NumberFormat::FORMAT_NUMBER,
                'decimal' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
                default => NumberFormat::FORMAT_TEXT,
            };
        }

        return $formats;
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'F0F0F0'],
                ],
            ],
        ];
    }

    public function title(): string
    {
        return mb_substr($this->dados->titulo, 0, 31);
    }

    private function columnIndexToLetter(int $index): string
    {
        $letter = '';
        $index++;

        while ($index > 0) {
            $mod = ($index - 1) % 26;
            $letter = chr(65 + $mod).$letter;
            $index = (int) (($index - $mod) / 26);
        }

        return $letter;
    }
}
