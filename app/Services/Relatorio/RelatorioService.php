<?php

declare(strict_types=1);

namespace App\Services\Relatorio;

use App\Enums\Relatorio\FormatoRelatorioEnum;
use App\Enums\Relatorio\TipoRelatorioEnum;
use App\Models\Espaco;
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
        $dados = $this->agregar($usuario, $tipo, $filtros);

        $this->validarLimites($dados, $formato);

        $nomeArquivo = sprintf('%s-%s.%s', $tipo->value, now()->format('Ymd-His'), $formato->value);

        return $this->exporters->make($formato)->exportar($dados, $nomeArquivo);
    }

    public function agregar(User $usuario, TipoRelatorioEnum $tipo, FiltrosRelatorio $filtros): DadosRelatorio
    {
        if (! $usuario->hasPermissionTo($tipo->permissao())) {
            abort(403, 'Tipo de relatório não disponível para este perfil.');
        }

        $filtros = $this->aplicarEscopo($usuario, $filtros);

        return $this->relatorios->make($tipo)->gerar($usuario, $filtros);
    }

    /**
     * Opcoes de localizacao para os filtros do inventario, ja restritas ao
     * escopo do usuario. Cada nivel carrega a chave do pai para permitir o
     * encadeamento dos comboboxes no frontend.
     *
     * @return array{
     *     unidades: array<int, array{id: int, nome: string}>,
     *     modulos: array<int, array{id: int, nome: string, unidade_id: int}>,
     *     andares: array<int, array{id: int, nome: string, modulo_id: int}>,
     *     espacos: array<int, array{id: int, nome: string, andar_id: int}>
     * }
     */
    public function opcoesInventario(User $usuario): array
    {
        $espacosQuery = Espaco::query()->with('andar.modulo.unidade');

        if ($usuario->hasRole('institucional')) {
            $instituicaoId = $usuario->setor->unidade->instituicao_id;
            $espacosQuery->whereHas(
                'andar.modulo.unidade',
                fn ($u) => $u->where('instituicao_id', $instituicaoId)
            );
        } elseif ($usuario->hasRole('gestor')) {
            $agendaIds = $usuario->agendas()->pluck('id')->all();
            $espacosQuery->whereHas('agendas', fn ($q) => $q->whereIn('id', $agendaIds));
        } else {
            abort(403);
        }

        $espacos = $espacosQuery->get()->filter(
            fn (Espaco $espaco) => $espaco->andar?->modulo?->unidade !== null
        );

        $unidades = [];
        $modulos = [];
        $andares = [];
        $listaEspacos = [];

        foreach ($espacos as $espaco) {
            $andar = $espaco->andar;
            $modulo = $andar->modulo;
            $unidade = $modulo->unidade;

            $unidades[$unidade->id] = ['id' => $unidade->id, 'nome' => $unidade->nome];
            $modulos[$modulo->id] = [
                'id' => $modulo->id,
                'nome' => $modulo->nome,
                'unidade_id' => $unidade->id,
            ];
            $andares[$andar->id] = [
                'id' => $andar->id,
                'nome' => $andar->nome,
                'modulo_id' => $modulo->id,
            ];
            $listaEspacos[$espaco->id] = [
                'id' => $espaco->id,
                'nome' => $espaco->nome,
                'andar_id' => $andar->id,
            ];
        }

        $ordenarPorNome = function (array $itens): array {
            usort($itens, fn ($a, $b) => strnatcasecmp($a['nome'], $b['nome']));

            return $itens;
        };

        return [
            'unidades' => $ordenarPorNome(array_values($unidades)),
            'modulos' => $ordenarPorNome(array_values($modulos)),
            'andares' => $ordenarPorNome(array_values($andares)),
            'espacos' => $ordenarPorNome(array_values($listaEspacos)),
        ];
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
