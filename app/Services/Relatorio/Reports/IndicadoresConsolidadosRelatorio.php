<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Reports;

use App\Enums\Relatorio\TipoRelatorioEnum;
use App\Models\Espaco;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use App\Services\Relatorio\Data\ColunaRelatorio;
use App\Services\Relatorio\Data\DadosRelatorio;
use App\Services\Relatorio\Data\FiltrosRelatorio;
use Carbon\CarbonImmutable;

final class IndicadoresConsolidadosRelatorio implements RelatorioInterface
{
    public function gerar(User $usuario, FiltrosRelatorio $filtros): DadosRelatorio
    {
        $instituicaoId = $filtros->instituicaoId;

        $totalEspacos = Espaco::query()
            ->whereHas('andar.modulo.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->count();

        $totalGestores = User::query()
            ->whereHas('agendas.espaco.andar.modulo.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->distinct('id')
            ->count();

        $reservasQuery = Reserva::query()
            ->whereHas('horarios.agenda.espaco.andar.modulo.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId));

        if ($filtros->dataInicio !== null || $filtros->dataFim !== null) {
            $reservasQuery->whereHas('horarios', function ($h) use ($filtros) {
                if ($filtros->dataInicio !== null && $filtros->dataFim !== null) {
                    $h->whereBetween('data', [$filtros->dataInicio, $filtros->dataFim]);
                } elseif ($filtros->dataInicio !== null) {
                    $h->where('data', '>=', $filtros->dataInicio);
                } elseif ($filtros->dataFim !== null) {
                    $h->where('data', '<=', $filtros->dataFim);
                }
            });
        }

        $totalReservas = $reservasQuery->count();

        $distribuicaoSituacoes = $reservasQuery->get()
            ->groupBy('situacao')
            ->map(fn ($group) => $group->count())
            ->all();

        $top5Espacos = Horario::query()
            ->where('situacao', 'deferida')
            ->whereHas('agenda.espaco.andar.modulo.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->with('agenda.espaco')
            ->get()
            ->groupBy(fn ($h) => $h->agenda->espaco_id)
            ->map(function ($horarios) {
                $espaco = $horarios->first()->agenda->espaco;

                return [
                    'nome' => $espaco->nome,
                    'count' => $horarios->count(),
                ];
            })
            ->sortByDesc('count')
            ->take(5)
            ->all();

        $top5Setores = Reserva::query()
            ->whereHas('user.setor.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->with('user.setor')
            ->get()
            ->groupBy(fn ($r) => $r->user->setor_id)
            ->map(function ($reservas) {
                $setor = $reservas->first()->user->setor;

                return [
                    'nome' => $setor->nome ?? '—',
                    'count' => $reservas->count(),
                ];
            })
            ->sortByDesc('count')
            ->take(5)
            ->all();

        $linhas = [
            ['metrica' => 'Total de Espaços', 'valor' => $totalEspacos],
            ['metrica' => 'Total de Gestores', 'valor' => $totalGestores],
            ['metrica' => 'Total de Reservas', 'valor' => $totalReservas],
        ];

        foreach ($distribuicaoSituacoes as $situacao => $count) {
            $linhas[] = [
                'metrica' => 'Reservas '.ucfirst(str_replace('_', ' ', $situacao)),
                'valor' => $count,
            ];
        }

        $linhas[] = ['metrica' => '— Top 5 Espaços —', 'valor' => ''];

        foreach ($top5Espacos as $espaco) {
            $linhas[] = [
                'metrica' => $espaco['nome'],
                'valor' => $espaco['count'],
            ];
        }

        $linhas[] = ['metrica' => '— Top 5 Setores —', 'valor' => ''];

        foreach ($top5Setores as $setor) {
            $linhas[] = [
                'metrica' => $setor['nome'],
                'valor' => $setor['count'],
            ];
        }

        $colunas = [
            new ColunaRelatorio('metrica', 'Métrica', 'string', 40),
            new ColunaRelatorio('valor', 'Valor', 'string', 15),
        ];

        $sumario = [
            'Total de Espaços' => $totalEspacos,
            'Total de Gestores' => $totalGestores,
            'Total de Reservas' => $totalReservas,
        ];

        return new DadosRelatorio(
            tipo: TipoRelatorioEnum::INDICADORES_CONSOLIDADOS,
            titulo: TipoRelatorioEnum::INDICADORES_CONSOLIDADOS->titulo(),
            subtitulo: 'Visão Consolidada da Instituição',
            colunas: $colunas,
            linhas: $linhas,
            sumario: $sumario,
            filtrosAplicados: $filtros->resumo(),
            geradoPor: $usuario->name,
            geradoEm: CarbonImmutable::now(),
        );
    }
}
