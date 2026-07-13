<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $dados->titulo }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11pt;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
        }

        header {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #1a1a1a;
        }

        .logo {
            max-height: 60px;
            margin-bottom: 10px;
        }

        .titulo {
            font-size: 18pt;
            font-weight: bold;
            margin: 10px 0 5px 0;
            color: #1a1a1a;
        }

        .subtitulo {
            font-size: 12pt;
            margin: 0 0 10px 0;
            color: #555;
        }

        .metadata {
            font-size: 9pt;
            color: #888;
            margin-top: 10px;
        }

        .conteudo {
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        thead {
            background-color: #f0f0f0;
        }

        th {
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            color: #1a1a1a;
        }

        td {
            border: 1px solid #ddd;
            padding: 8px;
        }

        tbody tr:nth-child(odd) {
            background-color: #fafafa;
        }

        .filtros {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 10px;
            margin: 15px 0;
            font-size: 10pt;
        }

        .filtros-titulo {
            font-weight: bold;
            margin-bottom: 8px;
        }

        .filtro-item {
            margin: 5px 0;
        }

        .sumario {
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            padding: 10px;
            margin: 15px 0;
            font-size: 10pt;
        }

        .sumario-titulo {
            font-weight: bold;
            margin-bottom: 8px;
        }

        .sumario-item {
            margin: 5px 0;
        }

        footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 9pt;
            color: #888;
            text-align: right;
        }

        .page-number:before {
            content: "Página " counter(page);
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <img src="{{ public_path('logo.svg') }}" alt="Logo" style="max-height: 60px;">
        </div>
        <div class="titulo">{{ $dados->titulo }}</div>
        @if ($dados->subtitulo)
            <div class="subtitulo">{{ $dados->subtitulo }}</div>
        @endif
        <div class="metadata">
            Gerado por {{ $dados->geradoPor }} em {{ $dados->geradoEm->setTimezone('America/Bahia')->format('d/m/Y H:i') }}
        </div>
    </header>

    @yield('conteudo')

    <footer>
        <div class="page-number"></div>
    </footer>

    <script type="text/php">
        if ( isset($pdf) ) {
            $font = $pdf->get_font_family();
            $size = $pdf->get_font_size();
            $pdf->set_font($font, '', $size - 2);
            $pdf->page_text(520, 810, "Página " . $pdf->get_page_number(), [], 10, [0, 0, 0]);
        }
    </script>
</body>
</html>
