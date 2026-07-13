<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Reports;

use App\Enums\Relatorio\TipoRelatorioEnum;
use App\Models\Horario;
use App\Models\User;
use App\Services\Relatorio\Data\ColunaRelatorio;
use App\Services\Relatorio\Data\DadosRelatorio;
use App\Services\Relatorio\Data\FiltrosRelatorio;
use Carbon\CarbonImmutable;

final class OcupacaoEspacosRelatorio implements RelatorioInterface
{
    public function gerar(User $usuario, FiltrosRelatorio $filtros): DadosRelatorio
    {
        $query = Horario::query()
            ->where('situacao', 'deferida')
            ->with('agenda.espaco.andar.modulo.unidade');

        if ($filtros->dataInicio !== null || $filtros->dataFim !== null) {
            if ($filtros->dataInicio !== null && $filtros->dataFim !== null) {
                $query->whereBetween('data', [$filtros->dataInicio, $filtros->dataFim]);
            } elseif ($filtros->dataInicio !== null) {
                $query->where('data', '>=', $filtros->dataInicio);
            } elseif ($filtros->dataFim !== null) {
                $query->where('data', '<=', $filtros->dataFim);
            }
        }

        if ($filtros->agendaIds !== null) {
            $query->whereIn('agenda_id', $filtros->agendaIds);
        }

        if ($filtros->instituicaoId !== null && $filtros->agendaIds === null) {
            $query->whereHas('agenda.espaco.andar.modulo.unidade', function ($u) use ($filtros) {
                $u->where('instituicao_id', $filtros->instituicaoId);
            });
        }

        $horarios = $query->get();

        $ocupacaoPorEspaco = $horarios->groupBy(function ($h) {
            return $h->agenda->espaco_id;
        })->map(function ($horariosEspaco) {
            $espaco = $horariosEspaco->first()->agenda->espaco;

            return [
                'espaco_id' => $espaco->id,
                'nome_espaco' => $espaco->nome,
                'capacidade_pessoas' => $espaco->capacidade_pessoas,
                'localizacao' => sprintf(
                    '%s / %s / %s',
                    $espaco->andar->nome ?? '—',
                    $espaco->andar->modulo->nome ?? '—',
                    $espaco->andar->modulo->unidade->nome ?? '—',
                ),
                'total_horarios_ocupados' => $horariosEspaco->count(),
            ];
        })->values();

        $linhas = $ocupacaoPorEspaco->map(function ($ocupacao) {
            $totalDias = 22;
            $turnosPorAgenda = 3;
            $totalCapacidade = $totalDias * $turnosPorAgenda;

            $taxaOcupacao = ($ocupacao['total_horarios_ocupados'] / $totalCapacidade) * 100;

            return [
                'espaco_id' => $ocupacao['espaco_id'],
                'nome_espaco' => $ocupacao['nome_espaco'],
                'capacidade_pessoas' => $ocupacao['capacidade_pessoas'],
                'localizacao' => $ocupacao['localizacao'],
                'total_horarios_ocupados' => $ocupacao['total_horarios_ocupados'],
                'total_dias_no_periodo' => $totalDias,
                'taxa_ocupacao' => number_format($taxaOcupacao, 2, '.', '').'%',
            ];
        })->toArray();

        $colunas = [
            new ColunaRelatorio('espaco_id', 'ID Espaço', 'integer', 8),
            new ColunaRelatorio('nome_espaco', 'Espaço', 'string', 20),
            new ColunaRelatorio('capacidade_pessoas', 'Capacidade', 'integer', 10),
            new ColunaRelatorio('localizacao', 'Localização', 'string', 25),
            new ColunaRelatorio('total_horarios_ocupados', 'Horários', 'integer', 8),
            new ColunaRelatorio('total_dias_no_periodo', 'Dias', 'integer', 6),
            new ColunaRelatorio('taxa_ocupacao', 'Taxa %', 'string', 8),
        ];

        $mediaTaxa = 0;
        if (count($linhas) > 0) {
            $totalTaxa = 0;
            foreach ($linhas as $linha) {
                $totalTaxa += (float) str_replace('%', '', $linha['taxa_ocupacao']);
            }
            $mediaTaxa = $totalTaxa / count($linhas);
        }

        $sumario = [
            'Total de Espaços' => count($linhas),
            'Média de Taxa de Ocupação' => number_format($mediaTaxa, 2).'%',
        ];

        $subtitulo = '';
        if ($filtros->dataInicio !== null && $filtros->dataFim !== null) {
            $subtitulo = "Período: {$filtros->dataInicio->format('d/m/Y')} a {$filtros->dataFim->format('d/m/Y')}";
        }

        return new DadosRelatorio(
            tipo: TipoRelatorioEnum::OCUPACAO_ESPACOS,
            titulo: TipoRelatorioEnum::OCUPACAO_ESPACOS->titulo(),
            subtitulo: $subtitulo,
            colunas: $colunas,
            linhas: $linhas,
            sumario: $sumario,
            filtrosAplicados: $filtros->resumo(),
            geradoPor: $usuario->name,
            geradoEm: CarbonImmutable::now(),
        );
    }
}
