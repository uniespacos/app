<?php

declare(strict_types=1);

namespace App\Services\Relatorio;

use App\Enums\Relatorio\FormatoRelatorioEnum;
use App\Enums\Relatorio\TipoRelatorioEnum;
use App\Models\User;
use App\Services\Relatorio\Data\DadosRelatorio;
use App\Services\Relatorio\Data\FiltrosRelatorio;
use App\Services\Relatorio\Exporters\ExporterFactory;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class RelatorioService
{
    public function __construct(
        private RelatorioFactory $relatorios,
        private ExporterFactory $exporters,
    ) {}

    public function gerar(User $usuario, TipoRelatorioEnum $tipo, FormatoRelatorioEnum $formato, FiltrosRelatorio $filtros): BinaryFileResponse|StreamedResponse
    {
        if (! $usuario->hasPermissionTo($tipo->permissao())) {
            abort(403, 'Tipo de relatório não disponível para este perfil.');
        }

        $filtros = $this->aplicarEscopo($usuario, $filtros);

        $dados = $this->relatorios->make($tipo)->gerar($usuario, $filtros);

        $this->validarLimites($dados, $formato);

        $nomeArquivo = sprintf('%s-%s.%s', $tipo->value, now()->format('Ymd-His'), $formato->value);

        return $this->exporters->make($formato)->exportar($dados, $nomeArquivo);
    }

    private function aplicarEscopo(User $usuario, FiltrosRelatorio $filtros): FiltrosRelatorio
    {
        if ($usuario->hasRole('institucional')) {
            return new FiltrosRelatorio(
                dataInicio: $filtros->dataInicio,
                dataFim: $filtros->dataFim,
                situacoes: $filtros->situacoes,
                turnos: $filtros->turnos,
                instituicaoId: $usuario->setor->unidade->instituicao_id,
                unidadeId: $filtros->unidadeId,
                moduloId: $filtros->moduloId,
                andarId: $filtros->andarId,
                espacoId: $filtros->espacoId,
                setorId: $filtros->setorId,
                agendaIds: $filtros->agendaIds,
            );
        }

        if ($usuario->hasRole('gestor')) {
            return new FiltrosRelatorio(
                dataInicio: $filtros->dataInicio,
                dataFim: $filtros->dataFim,
                situacoes: $filtros->situacoes,
                turnos: $filtros->turnos,
                instituicaoId: null,
                unidadeId: null,
                moduloId: null,
                andarId: null,
                espacoId: $filtros->espacoId,
                setorId: null,
                agendaIds: $usuario->agendas()->pluck('id')->all(),
            );
        }

        abort(403);
    }

    private function validarLimites(DadosRelatorio $dados, FormatoRelatorioEnum $formato): void
    {
        $totalLinhas = $dados->totalLinhas();
        $limite = $formato === FormatoRelatorioEnum::PDF
            ? config('relatorios.limites.max_linhas_pdf')
            : config('relatorios.limites.max_linhas_csv_xlsx');

        if ($totalLinhas > $limite) {
            abort(422, "Relatório excede o limite de {$limite} linhas para este formato. Refine os filtros.");
        }
    }
}
