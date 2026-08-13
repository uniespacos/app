<?php

declare(strict_types=1);

namespace App\Services\Relatorio;

use App\Enums\Relatorio\TipoRelatorioEnum;
use App\Services\Relatorio\Reports\RelatorioInterface;
use Illuminate\Contracts\Container\Container;
use RuntimeException;

final class RelatorioFactory
{
    public function __construct(
        private Container $container,
    ) {}

    public function make(TipoRelatorioEnum $tipo): RelatorioInterface
    {
        $classe = config("relatorios.tipos.{$tipo->value}");

        if (! $classe || ! class_exists($classe)) {
            throw new RuntimeException("Relatório não registrado: {$tipo->value}");
        }

        return $this->container->make($classe);
    }
}
