<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Espaco;
use App\Repositories\EspacoRepositoryInterface;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\SvgWriter;

class QrCodeService
{
    public function __construct(
        protected EspacoRepositoryInterface $repoEspaco,
    ) {}

    /**
     * Gera o SVG do QR Code que leva ao formulario publico de report do espaco.
     * Nivel de correcao alto porque o adesivo fica exposto a desgaste na porta.
     */
    public function svgParaEspaco(Espaco $espaco, int $tamanho = 220): string
    {
        $url = route('chamados.reportar', ['espaco' => $espaco->public_id]);

        $resultado = (new Builder(
            writer: new SvgWriter,
            writerOptions: [SvgWriter::WRITER_OPTION_EXCLUDE_XML_DECLARATION => true],
            data: $url,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: $tamanho,
            margin: 4,
        ))->build();

        return $resultado->getString();
    }

    /**
     * Monta a folha de adesivos, opcionalmente restrita a uma unidade ou modulo.
     *
     * @return list<array{nome: string, localizacao: string, url: string, svg: string}>
     */
    public function adesivosParaImpressao(?int $unidadeId = null, ?int $moduloId = null): array
    {
        return $this->adesivosParaEspacos(
            $this->repoEspaco->getParaAdesivos($unidadeId, $moduloId)
        );
    }

    /**
     * Monta os dados de impressao dos adesivos de uma colecao de espacos.
     *
     * @param  iterable<Espaco>  $espacos
     * @return list<array{nome: string, localizacao: string, url: string, svg: string}>
     */
    public function adesivosParaEspacos(iterable $espacos): array
    {
        $adesivos = [];

        foreach ($espacos as $espaco) {
            $adesivos[] = [
                'nome' => $espaco->nome,
                'localizacao' => $espaco->localizacao_completa,
                'url' => route('chamados.reportar', ['espaco' => $espaco->public_id]),
                'svg' => $this->svgParaEspaco($espaco),
            ];
        }

        return $adesivos;
    }
}
