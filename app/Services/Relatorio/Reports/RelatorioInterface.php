<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Reports;

use App\Models\User;
use App\Services\Relatorio\Data\DadosRelatorio;
use App\Services\Relatorio\Data\FiltrosRelatorio;

interface RelatorioInterface
{
    public function gerar(User $usuario, FiltrosRelatorio $filtros): DadosRelatorio;
}
