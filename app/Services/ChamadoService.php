<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\Chamado\StatusChamadoEnum;
use App\Models\CategoriaChamado;
use App\Models\Chamado;
use App\Models\Espaco;
use App\Models\TipoChamado;
use App\Models\User;
use App\Notifications\ChamadoOrfaoNotification;
use App\Notifications\ChamadoResolvidoNotification;
use App\Notifications\NovoChamadoNotification;
use App\Repositories\CategoriaChamadoRepositoryInterface;
use App\Repositories\ChamadoRepositoryInterface;
use App\Repositories\EspacoRepositoryInterface;
use App\Repositories\TipoChamadoRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class ChamadoService
{
    public function __construct(
        protected ChamadoRepositoryInterface $repoChamado,
        protected EspacoRepositoryInterface $repoEspaco,
        protected UserRepositoryInterface $repoUser,
        protected TipoChamadoRepositoryInterface $repoTipo,
        protected CategoriaChamadoRepositoryInterface $repoCategoria,
    ) {}

    /**
     * Registra um chamado aberto de forma anonima a partir do QR Code do espaco.
     *
     * @param  array<string, mixed>  $data
     * @param  list<UploadedFile>  $fotos
     */
    public function registrarParaEspaco(Espaco $espaco, array $data, array $fotos = []): Chamado
    {
        $chamado = DB::transaction(function () use ($espaco, $data, $fotos) {
            $paths = [];

            foreach ($fotos as $foto) {
                $paths[] = $foto->store('chamados_fotos', 'public');
            }

            return $this->repoChamado->store([
                'reportable_type' => Espaco::class,
                'reportable_id' => $espaco->id,
                'tipo_id' => $data['tipo_id'],
                'categoria_id' => $data['categoria_id'],
                'descricao' => $data['descricao'],
                'status' => StatusChamadoEnum::ABERTO->value,
                'contato_nome' => $data['contato_nome'] ?? null,
                'contato_email' => $data['contato_email'] ?? null,
                'fotos' => $paths !== [] ? $paths : null,
            ]);
        });

        $this->notificarGestores($espaco, $chamado);

        return $chamado;
    }

    /**
     * Avisa todos os gestores do espaco, ou o pessoal institucional quando nao houver nenhum.
     */
    private function notificarGestores(Espaco $espaco, Chamado $chamado): void
    {
        try {
            $gestores = $this->repoUser->getPorIds(
                $this->repoEspaco->getGestorIdsDoEspaco($espaco->id)
            );

            if ($gestores->isEmpty()) {
                Log::warning('Chamado aberto em espaco sem gestor atribuido.', [
                    'chamado_id' => $chamado->id,
                    'espaco_id' => $espaco->id,
                ]);

                $this->notificarInstitucionaisSobreOrfao($chamado);

                return;
            }

            Notification::send($gestores, new NovoChamadoNotification($chamado));
        } catch (\Exception $e) {
            Log::error('Erro ao notificar gestores sobre novo chamado: '.$e->getMessage());
        }
    }

    /**
     * Fila de chamados dos espacos que o gestor administra.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getListagemParaGestor(User $gestor, array $filters = []): array
    {
        $espacoIds = $this->repoEspaco->getIdsGeridosPor($gestor->id);

        $chamados = $this->repoChamado->getPaginatedForEspacos($espacoIds, $filters);

        $chamados->getCollection()->transform(function (Chamado $chamado): array {
            $alvo = $chamado->reportable;

            return [
                'id' => $chamado->id,
                'protocolo' => $chamado->protocolo,
                'tipo' => $chamado->tipo?->nome,
                'tipo_valor' => $chamado->tipo_id,
                'categoria' => $chamado->categoria?->nome,
                'categoria_valor' => $chamado->categoria_id,
                'status' => StatusChamadoEnum::labelDe($chamado->status),
                'status_valor' => $chamado->status,
                'descricao' => $chamado->descricao,
                'fotos' => array_map(
                    fn (string $path): string => Storage::disk('public')->url($path),
                    $chamado->fotos ?? []
                ),
                'contato_nome' => $chamado->contato_nome,
                'contato_email' => $chamado->contato_email,
                'criado_em' => $chamado->created_at?->format('d/m/Y H:i'),
                'espaco' => $alvo instanceof Espaco ? $alvo->nome : null,
                'localizacao' => $alvo instanceof Espaco ? $alvo->localizacao_completa : null,
            ];
        });

        return [
            'chamados' => $chamados,
            'filters' => $filters,
            'tipos' => $this->tiposParaSelect(),
            'categorias' => $this->categoriasParaSelect(),
            'statusDisponiveis' => array_map(
                fn (StatusChamadoEnum $caso): array => ['value' => $caso->value, 'label' => $caso->label()],
                StatusChamadoEnum::cases()
            ),
            'totalAbertos' => $this->repoChamado->countAbertosParaEspacos($espacoIds),
        ];
    }

    /**
     * Registra a triagem do gestor sobre um chamado.
     *
     * @param  array<string, mixed>  $data
     */
    public function triar(Chamado $chamado, User $gestor, array $data): Chamado
    {
        $statusAnterior = $chamado->status;

        $chamado = DB::transaction(function () use ($chamado, $gestor, $data) {
            $status = $data['status'];
            $encerrado = in_array($status, [
                StatusChamadoEnum::RESOLVIDO->value,
                StatusChamadoEnum::CANCELADO->value,
            ], true);

            $chamado->update([
                'status' => $status,
                'resolvido_por' => $encerrado ? $gestor->id : null,
                'resolvido_em' => $encerrado ? now() : null,
            ]);

            return $chamado->refresh();
        });

        $this->notificarReportante($chamado, $statusAnterior);

        return $chamado;
    }

    /**
     * Avisa o pessoal institucional sobre um chamado aberto em espaco sem gestor.
     */
    private function notificarInstitucionaisSobreOrfao(Chamado $chamado): void
    {
        $institucionais = $this->repoUser->getComPermissao('secao.gestao-espacos');

        if ($institucionais->isEmpty()) {
            return;
        }

        Notification::send($institucionais, new ChamadoOrfaoNotification($chamado));
    }

    /**
     * Avisa por e-mail quem deixou contato no formulario publico, uma unica
     * vez, quando o chamado passa a encerrado.
     */
    private function notificarReportante(Chamado $chamado, string $statusAnterior): void
    {
        $encerrado = in_array($chamado->status, [
            StatusChamadoEnum::RESOLVIDO->value,
            StatusChamadoEnum::CANCELADO->value,
        ], true);

        if (! $encerrado || $chamado->status === $statusAnterior || blank($chamado->contato_email)) {
            return;
        }

        try {
            Notification::route('mail', $chamado->contato_email)
                ->notify(new ChamadoResolvidoNotification($chamado));
        } catch (\Exception $e) {
            Log::error('Erro ao notificar reportante do chamado: '.$e->getMessage());
        }
    }

    /**
     * Fila de chamados orfaos: espacos sem gestor em nenhuma agenda.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getListagemOrfaos(array $filters = []): array
    {
        $chamados = $this->repoChamado->getPaginatedOrfaos($filters);

        $chamados->getCollection()->transform(function (Chamado $chamado): array {
            $alvo = $chamado->reportable;

            return [
                'id' => $chamado->id,
                'protocolo' => $chamado->protocolo,
                'tipo' => $chamado->tipo?->nome,
                'categoria' => $chamado->categoria?->nome,
                'status' => StatusChamadoEnum::labelDe($chamado->status),
                'descricao' => $chamado->descricao,
                'fotos' => array_map(
                    fn (string $path): string => Storage::disk('public')->url($path),
                    $chamado->fotos ?? []
                ),
                'criado_em' => $chamado->created_at?->format('d/m/Y H:i'),
                'espaco' => $alvo instanceof Espaco ? $alvo->nome : null,
                'espaco_id' => $alvo instanceof Espaco ? $alvo->id : null,
                'localizacao' => $alvo instanceof Espaco ? $alvo->localizacao_completa : null,
            ];
        });

        return [
            'chamados' => $chamados,
            'filters' => $filters,
            'tipos' => $this->tiposParaSelect(),
            'categorias' => $this->categoriasParaSelect(),
            'totalOrfaos' => $this->repoChamado->countOrfaos(),
        ];
    }

    /**
     * Resumo dos chamados em aberto de um espaco, para o alerta informativo
     * exibido a quem esta prestes a reservar.
     *
     * @return array{total: int, categorias: list<array{label: string, total: int}>}
     */
    public function getResumoAbertosParaEspaco(Espaco $espaco): array
    {
        $porCategoria = $this->repoChamado->categoriasAbertasParaEspaco($espaco->id);

        $categorias = [];

        foreach ($porCategoria as $categoria => $total) {
            $categorias[] = [
                'label' => (string) $categoria,
                'total' => (int) $total,
            ];
        }

        usort($categorias, fn (array $a, array $b): int => $b['total'] <=> $a['total']);

        return [
            'total' => array_sum($porCategoria),
            'categorias' => $categorias,
        ];
    }

    /**
     * Tipos disponiveis para escolha no formulario publico e nos filtros.
     *
     * @return list<array{value: int, label: string, descricao: ?string}>
     */
    public function tiposParaSelect(): array
    {
        return $this->repoTipo->getList()
            ->map(fn (TipoChamado $tipo): array => [
                'value' => $tipo->id,
                'label' => $tipo->nome,
                'descricao' => $tipo->descricao,
            ])
            ->all();
    }

    /**
     * Categorias disponiveis para escolha no formulario publico e nos filtros.
     *
     * @return list<array{value: int, label: string, descricao: ?string}>
     */
    public function categoriasParaSelect(): array
    {
        return $this->repoCategoria->getList()
            ->map(fn (CategoriaChamado $categoria): array => [
                'value' => $categoria->id,
                'label' => $categoria->nome,
                'descricao' => $categoria->descricao,
            ])
            ->all();
    }

    /**
     * Dados do espaco exibidos a quem escaneou o QR Code, para confirmar
     * que esta reportando a sala certa.
     *
     * @return array<string, mixed>
     */
    public function getDadosDoEspacoParaReport(Espaco $espaco): array
    {
        $espaco->loadMissing('andar.modulo.unidade');

        return [
            'id' => $espaco->public_id,
            'nome' => $espaco->nome,
            'localizacao' => $espaco->localizacao_completa,
            'chamados_abertos' => $this->repoChamado->countAbertosParaEspaco($espaco->id),
        ];
    }
}
