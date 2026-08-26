@extends('emails.layout')

@section('content')
    <p>Prezado(a) gestor(a),</p>
    <p>Um novo problema foi reportado em um espaço sob sua gestão:</p>

    <ul>
        @if($espaco)
            <li><strong>Espaço:</strong> {{ $espaco->nome }}</li>
            <li><strong>Localização:</strong> {{ $espaco->localizacao_completa }}</li>
        @endif
        <li><strong>Tipo:</strong> {{ $tipo }}</li>
        <li><strong>Assunto:</strong> {{ $categoria }}</li>
        <li><strong>Protocolo:</strong> {{ $chamado->protocolo }}</li>
        <li><strong>Registrado em:</strong> {{ $chamado->created_at?->format('d/m/Y H:i') }}</li>
        @if($chamado->contato_nome || $chamado->contato_email)
            <li><strong>Contato do reportante:</strong>
                {{ $chamado->contato_nome ?? 'Não informado' }}
                @if($chamado->contato_email)
                    ({{ $chamado->contato_email }})
                @endif
            </li>
        @else
            <li><strong>Reportado anonimamente</strong></li>
        @endif
        @if(!empty($chamado->fotos))
            <li><strong>Fotos anexadas:</strong> {{ count($chamado->fotos) }}</li>
        @endif
    </ul>

    <p><strong>Descrição:</strong></p>
    <p>{{ $chamado->descricao }}</p>

    <p style="text-align: center; margin: 24px 0;">
        <a href="{{ $url }}" class="button">Ver chamados</a>
    </p>

    <p>Este report foi enviado pelo QR Code fixado no espaço, sem necessidade de login.</p>
@endsection
