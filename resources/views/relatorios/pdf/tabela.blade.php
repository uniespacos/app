@extends('relatorios.pdf.layout')

@section('conteudo')
    <div class="conteudo">
        @if (! empty($dados->filtrosAplicados))
            <div class="filtros">
                <div class="filtros-titulo">Filtros Aplicados:</div>
                @foreach ($dados->filtrosAplicados as $chave => $valor)
                    <div class="filtro-item">
                        <strong>{{ $chave }}:</strong> {{ $valor }}
                    </div>
                @endforeach
            </div>
        @endif

        <table>
            <thead>
                <tr>
                    @foreach ($dados->colunas as $coluna)
                        <th style="width: {{ $coluna->largura }}%;">{{ $coluna->rotulo }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach ($dados->linhas as $linha)
                    <tr>
                        @foreach ($dados->colunas as $coluna)
                            <td>{{ $linha[$coluna->chave] ?? '—' }}</td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>

        @if (! empty($dados->sumario))
            <div class="sumario">
                <div class="sumario-titulo">Sumário:</div>
                @foreach ($dados->sumario as $chave => $valor)
                    <div class="sumario-item">
                        <strong>{{ $chave }}:</strong> {{ $valor }}
                    </div>
                @endforeach
            </div>
        @endif
    </div>
@endsection
