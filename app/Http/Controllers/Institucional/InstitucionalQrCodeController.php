<?php

declare(strict_types=1);

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Models\Espaco;
use App\Services\QrCodeService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InstitucionalQrCodeController extends Controller
{
    public function __construct(
        protected QrCodeService $service,
    ) {}

    /**
     * Folha de adesivos imprimivel com o QR Code de cada espaco.
     */
    public function adesivos(Request $request): View
    {
        return view('chamados.adesivos', [
            'adesivos' => $this->service->adesivosParaImpressao(
                $request->integer('unidade') ?: null,
                $request->integer('modulo') ?: null,
            ),
        ]);
    }

    /**
     * QR Code isolado de um espaco, em SVG.
     */
    public function espaco(Espaco $espaco): Response
    {
        return response($this->service->svgParaEspaco($espaco), 200, [
            'Content-Type' => 'image/svg+xml',
        ]);
    }
}
