<?php

declare(strict_types=1);
use App\Services\Relatorio\Reports\IndicadoresConsolidadosRelatorio;
use App\Services\Relatorio\Reports\InventarioEspacosRelatorio;
use App\Services\Relatorio\Reports\OcupacaoEspacosRelatorio;
use App\Services\Relatorio\Reports\ReservasPeriodoRelatorio;

return [
    'tipos' => [
        'reservas_periodo' => ReservasPeriodoRelatorio::class,
        'ocupacao_espacos' => OcupacaoEspacosRelatorio::class,
        'inventario_espacos' => InventarioEspacosRelatorio::class,
        'indicadores_consolidados' => IndicadoresConsolidadosRelatorio::class,
    ],
    'limites' => [
        'max_linhas_csv_xlsx' => 10_000,
        'max_linhas_pdf' => 1_500,
    ],
    'pdf' => [
        'orientacao_padrao' => 'portrait',
        'tamanho' => 'A4',
        'cor_primaria' => '#1a1a1a',
    ],
    'csv' => [
        'delimiter' => ';',
        'use_bom' => true,
    ],
];
