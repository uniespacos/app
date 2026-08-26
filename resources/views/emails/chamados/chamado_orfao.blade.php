@extends('emails.layout')

@section('content')
    <p>Prezado(a),</p>

    <p>
        Um problema foi reportado em um espaço que <strong>não possui gestor atribuído em nenhum turno</strong>.
        Sem um responsável definido, este chamado não chega a ninguém pela fila normal.
    </p>

    <ul>
        @if($espaco)
            <li><strong>Espaço:</strong> {{ $espaco->nome }}</li>
            <li><strong>Localização:</strong> {{ $espaco->localizacao_completa }}</li>
        @endif
        <li><strong>Tipo:</strong> {{ $tipo }}</li>
        <li><strong>Assunto:</strong> {{ $categoria }}</li>
        <li><strong>Protocolo:</strong> {{ $chamado->protocolo }}</li>
        <li><strong>Registrado em:</strong> {{ $chamado->created_at?->format('d/m/Y H:i') }}</li>
    </ul>

    <p><strong>Descrição:</strong></p>
    <p>{{ $chamado->descricao }}</p>

    <p style="text-align: center; margin: 24px 0;">
        <a href="{{ $url }}" class="button">Ver chamados sem gestor</a>
    </p>

    <p>
        Atribuir um gestor ao espaço faz com que os próximos reports cheguem direto a quem é responsável.
    </p>
@endsection
