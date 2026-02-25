@extends('emails.layout')

@section('content')
    <p>Prezado(a) {{ $reserva->user->name }},</p>
    <p>Sua solicitação de reserva para <strong>'{{ $reserva->titulo }}'</strong> foi criada com sucesso e está aguardando avaliação.</p>

    <ul>
        <li><strong>Título da Reserva:</strong> {{ $reserva->titulo }}</li>
        <li><strong>Espaço:</strong> {{ $reserva->horarios->first()->agenda->espaco->nome ?? 'N/A' }}</li>
        <li><strong>Data/Horário:</strong>
            @foreach($reserva->resumo_horarios as $item)
                <p>{{ $item->texto }}</p>
            @endforeach
        </li>
        <li><strong>Status Inicial:</strong> {{ $reserva->situacao_formatada }}</li>
    </ul>

    <p>Você será notificado assim que sua reserva for avaliada pelos gestores responsáveis.</p>

    <p>Para acompanhar o status da sua reserva, clique no botão abaixo:</p>
    <a href="{{ $url }}" class="button">Acompanhar Reserva</a>

    <p>Atenciosamente,</p>
    <p>Equipe UniEspaços</p>
@endsection
