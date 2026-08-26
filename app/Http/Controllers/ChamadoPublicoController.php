<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\Chamado\StatusChamadoEnum;
use App\Http\Requests\StoreChamadoPublicoRequest;
use App\Models\Chamado;
use App\Models\Espaco;
use App\Services\ChamadoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Honeypot\Honeypot;

class ChamadoPublicoController extends Controller
{
    public function __construct(
        protected ChamadoService $service,
    ) {}

    /**
     * Formulario publico de report, acessado pelo QR Code fixado no espaco.
     * Sem autenticacao.
     */
    public function create(Espaco $espaco, Honeypot $honeypot): Response
    {
        $tipos = $this->service->tiposParaSelect();
        $categorias = $this->service->categoriasParaSelect();

        return Inertia::render('Chamados/ReportarPage', [
            'espaco' => $this->service->getDadosDoEspacoParaReport($espaco),
            'tipos' => $tipos,
            'categorias' => $categorias,
            'catalogoVazio' => $tipos === [] || $categorias === [],
            'honeypot' => $honeypot->toArray(),
        ]);
    }

    /**
     * Registra o chamado reportado anonimamente.
     */
    public function store(StoreChamadoPublicoRequest $request, Espaco $espaco): RedirectResponse
    {
        try {
            $chamado = $this->service->registrarParaEspaco(
                $espaco,
                $request->validated(),
                $request->file('fotos', [])
            );

            return redirect()->route('chamados.reportar.sucesso', ['chamado' => $chamado->protocolo]);
        } catch (\Exception $e) {
            Log::error('Erro ao registrar chamado publico: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Ocorreu um erro inesperado ao registrar o chamado. Tente novamente.')
                ->withInput();
        }
    }

    /**
     * Confirmacao com o protocolo, exibida apos o envio.
     */
    public function sucesso(Chamado $chamado): Response
    {
        $chamado->loadMissing(['tipo', 'categoria', 'reportable' => fn ($q) => $q->morphWith([
            Espaco::class => ['andar.modulo.unidade'],
        ])]);

        $alvo = $chamado->reportable;

        return Inertia::render('Chamados/ReportarSucessoPage', [
            'chamado' => [
                'protocolo' => $chamado->protocolo,
                'tipo' => $chamado->tipo?->nome,
                'categoria' => $chamado->categoria?->nome,
                'status' => StatusChamadoEnum::labelDe($chamado->status),
                'criado_em' => $chamado->created_at?->format('d/m/Y H:i'),
                'tem_contato' => filled($chamado->contato_email),
                'espaco' => $alvo instanceof Espaco ? $alvo->nome : null,
                'localizacao' => $alvo instanceof Espaco ? $alvo->localizacao_completa : null,
            ],
        ]);
    }
}
