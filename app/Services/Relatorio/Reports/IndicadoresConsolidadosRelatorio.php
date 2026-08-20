<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Reports;

use App\Enums\Relatorio\TipoRelatorioEnum;
use App\Enums\SituacaoReserva\SituacaoReservaEnum;
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

        $distribuicaoSituacoes = (clone $reservasQuery)
            ->selectRaw('situacao, count(*) as total')
            ->groupBy('situacao')
            ->pluck('total', 'situacao')
            ->map(fn ($total) => (int) $total)
            ->all();

        $top5Espacos = Horario::query()
            ->where('horarios.situacao', 'deferida')
            ->whereHas('agenda.espaco.andar.modulo.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->join('agendas', 'horarios.agenda_id', '=', 'agendas.id')
            ->join('espacos', 'agendas.espaco_id', '=', 'espacos.id')
            ->groupBy('espacos.id', 'espacos.nome')
            ->selectRaw('espacos.nome as nome, count(*) as count')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'nome' => $row->getAttribute('nome'),
                'count' => (int) $row->getAttribute('count'),
            ])
            ->all();

        $top5Setores = Reserva::query()
            ->whereHas('user.setor.unidade', fn ($q) => $q->where('instituicao_id', $instituicaoId))
            ->join('users', 'reservas.user_id', '=', 'users.id')
            ->join('setors', 'users.setor_id', '=', 'setors.id')
            ->groupBy('setors.id', 'setors.nome')
            ->selectRaw('setors.nome as nome, count(*) as count')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'nome' => $row->getAttribute('nome') ?? '—',
                'count' => (int) $row->getAttribute('count'),
            ])
            ->all();

        $linhas = [
            ['metrica' => 'Total de Espaços', 'valor' => $totalEspacos],
            ['metrica' => 'Total de Gestores', 'valor' => $totalGestores],
            ['metrica' => 'Total de Reservas', 'valor' => $totalReservas],
        ];

        foreach ($distribuicaoSituacoes as $situacao => $count) {
            $linhas[] = [
                'metrica' => 'Reservas '.SituacaoReservaEnum::labelDe((string) $situacao),
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
