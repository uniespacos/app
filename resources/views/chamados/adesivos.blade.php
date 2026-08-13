<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Adesivos QR Code — Reportar problema</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 16px;
            color: #111;
            background: #f5f5f5;
        }
        .barra-acoes {
            max-width: 210mm;
            margin: 0 auto 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }
        .barra-acoes h1 { font-size: 16px; margin: 0; font-weight: 600; }
        .barra-acoes button {
            padding: 8px 16px;
            border: 1px solid #111;
            background: #111;
            color: #fff;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        .folha {
            max-width: 210mm;
            margin: 0 auto;
            background: #fff;
            padding: 10mm;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8mm;
        }
        .adesivo {
            border: 1px dashed #bbb;
            border-radius: 8px;
            padding: 8mm 4mm;
            text-align: center;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .adesivo .chamada {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 2mm;
        }
        .adesivo .instrucao {
            font-size: 11px;
            color: #444;
            margin-bottom: 4mm;
            line-height: 1.4;
        }
        .adesivo svg { width: 45mm; height: 45mm; display: block; margin: 0 auto; }
        .adesivo .espaco {
            margin-top: 4mm;
            font-size: 13px;
            font-weight: 600;
        }
        .adesivo .local { font-size: 10px; color: #555; margin-top: 1mm; }
        .adesivo .url {
            font-size: 8px;
            color: #888;
            margin-top: 3mm;
            word-break: break-all;
            font-family: ui-monospace, monospace;
        }
        .vazio { text-align: center; padding: 40px; color: #666; }
        @media print {
            body { background: #fff; padding: 0; }
            .barra-acoes { display: none; }
            .folha { max-width: none; padding: 0; gap: 6mm; }
        }
    </style>
</head>
<body>
    <div class="barra-acoes">
        <h1>{{ count($adesivos) }} adesivo(s) — recorte no tracejado e fixe na porta do espaço</h1>
        <button onclick="window.print()">Imprimir</button>
    </div>

    <div class="folha">
        @forelse ($adesivos as $adesivo)
            <div class="adesivo">
                <div class="chamada">Algum problema nesta sala?</div>
                <div class="instrucao">Aponte a câmera do celular para o código<br>e conte o que está errado. Não precisa de login.</div>
                {!! $adesivo['svg'] !!}
                <div class="espaco">{{ $adesivo['nome'] }}</div>
                <div class="local">{{ $adesivo['localizacao'] }}</div>
                <div class="url">{{ $adesivo['url'] }}</div>
            </div>
        @empty
            <p class="vazio">Nenhum espaço encontrado para gerar adesivos.</p>
        @endforelse
    </div>
</body>
</html>
