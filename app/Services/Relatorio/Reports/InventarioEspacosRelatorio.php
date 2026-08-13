<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Reports;

use App\Enums\Relatorio\TipoRelatorioEnum;
use App\Models\Espaco;
use App\Models\User;
use App\Services\Relatorio\Data\ColunaRelatorio;
use App\Services\Relatorio\Data\DadosRelatorio;
use App\Services\Relatorio\Data\FiltrosRelatorio;
use Carbon\CarbonImmutable;

final class InventarioEspacosRelatorio implements RelatorioInterface
{
    public function gerar(User $usuario, FiltrosRelatorio $filtros): DadosRelatorio
    {
        $query = Espaco::query()->with(['andar.modulo.unidade', 'agendas.user']);

        if ($filtros->agendaIds !== null) {
            $query->whereHas('agendas', fn ($q) => $q->whereIn('id', $filtros->agendaIds));
        } elseif ($filtros->instituicaoId !== null) {
            $query->whereHas('andar.modulo.unidade', fn ($q) => $q->where('instituicao_id', $filtros->instituicaoId));
        }

        if ($filtros->unidadeId !== null) {
            $query->whereHas('andar.modulo.unidade', fn ($q) => $q->where('id', $filtros->unidadeId));
        }

        if ($filtros->moduloId !== null) {
            $query->whereHas('andar.modulo', fn ($q) => $q->where('id', $filtros->moduloId));
        }

        if ($filtros->andarId !== null) {
            $query->whereHas('andar', fn ($q) => $q->where('id', $filtros->andarId));
        }

        if ($filtros->espacoId !== null) {
            $query->where('id', $filtros->espacoId);
        }

        $espacos = $query->get();

        $linhas = $espacos->map(function (Espaco $espaco) {
            $gestores = $espaco->agendas
                ->pluck('user.name')
                ->unique()
                ->join(', ');

            return [
                'id' => $espaco->id,
                'nome' => $espaco->nome,
                'capacidade_pessoas' => $espaco->capacidade_pessoas,
                'unidade' => $espaco->andar->modulo->unidade->nome ?? '—',
                'modulo' => $espaco->andar->modulo->nome ?? '—',
                'andar' => $espaco->andar->nome ?? '—',
                'total_agendas' => $espaco->agendas->count(),
                'gestores' => $gestores ?: '—',
            ];
        })->toArray();

        $colunas = [
            new ColunaRelatorio('id', 'ID', 'integer', 5),
            new ColunaRelatorio('nome', 'Nome', 'string', 20),
            new ColunaRelatorio('capacidade_pessoas', 'Capacidade', 'integer', 10),
            new ColunaRelatorio('unidade', 'Unidade', 'string', 15),
            new ColunaRelatorio('modulo', 'Módulo', 'string', 15),
            new ColunaRelatorio('andar', 'Andar', 'string', 10),
            new ColunaRelatorio('total_agendas', 'Agendas', 'integer', 8),
            new ColunaRelatorio('gestores', 'Gestores', 'string', 25),
        ];

        $capacidadeTotal = $espacos->sum('capacidade_pessoas');
        $mediaCapacidade = count($linhas) > 0 ? $capacidadeTotal / count($linhas) : 0;
        $totalGestores = $espacos
            ->flatMap(fn ($e) => $e->agendas->pluck('user.id'))
            ->unique()
            ->count();

        $sumario = [
            'Total de Espaços' => count($linhas),
            'Capacidade Total' => $capacidadeTotal,
            'Média de Capacidade' => number_format($mediaCapacidade, 0),
            'Total de Gestores Únicos' => $totalGestores,
        ];

        return new DadosRelatorio(
            tipo: TipoRelatorioEnum::INVENTARIO_ESPACOS,
            titulo: TipoRelatorioEnum::INVENTARIO_ESPACOS->titulo(),
            subtitulo: '',
            colunas: $colunas,
            linhas: $linhas,
            sumario: $sumario,
            filtrosAplicados: $filtros->resumo(),
            geradoPor: $usuario->name,
            geradoEm: CarbonImmutable::now(),
        );
    }
}
