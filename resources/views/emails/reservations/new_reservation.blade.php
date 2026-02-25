@extends('emails.layout')

@section('content')
    <p>Prezado(a) gestor(a),</p>
    <p>Uma nova solicitação de reserva foi criada:</p>

    <ul>
        <li><strong>Título da Reserva:</strong> {{ $reserva->titulo }}</li>
        <li><strong>Espaço:</strong> {{ $reserva->horarios->first()->agenda->espaco->nome ?? 'N/A' }}</li>
        <li><strong>Solicitante:</strong> {{ $reserva->user->name }}</li>
        <li><strong>Data/Horário:</strong>
            @foreach($reserva->resumo_horarios as $item)
                <p>{{ $item->texto }}</p>
            @endforeach
        </li>
        <li><strong>Status Atual:</strong> {{ $reserva->situacao_formatada }}</li>
    </ul>

    <p>Para visualizar os detalhes completos e tomar uma ação, clique no botão abaixo:</p>
    <a href="{{ $url }}" class="button">Visualizar Reserva</a>

    <p>Atenciosamente,</p>
    <p>Equipe UniEspaços</p>
@endsection
