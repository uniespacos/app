@extends('emails.layout')

@section('content')
    <p>Olá{{ $chamado->contato_nome ? ', '.$chamado->contato_nome : '' }}!</p>

    <p>O problema que você reportou teve sua situação atualizada para <strong>{{ $status }}</strong>.</p>

    <ul>
        @if($espaco)
            <li><strong>Espaço:</strong> {{ $espaco->nome }}</li>
            <li><strong>Localização:</strong> {{ $espaco->localizacao_completa }}</li>
        @endif
        <li><strong>Tipo:</strong> {{ $tipo }}</li>
        <li><strong>Assunto:</strong> {{ $categoria }}</li>
        <li><strong>Protocolo:</strong> {{ $chamado->protocolo }}</li>
        <li><strong>Reportado em:</strong> {{ $chamado->created_at?->format('d/m/Y H:i') }}</li>
        @if($chamado->resolvido_em)
            <li><strong>Atualizado em:</strong> {{ $chamado->resolvido_em->format('d/m/Y H:i') }}</li>
        @endif
    </ul>

    <p><strong>O que você reportou:</strong></p>
    <p>{{ $chamado->descricao }}</p>

    <p>Obrigado por ajudar a manter o campus funcionando. Se o problema persistir, basta escanear o QR Code do espaço novamente.</p>
@endsection
