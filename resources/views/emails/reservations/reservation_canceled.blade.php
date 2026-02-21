@extends('emails.layout')

@section('content')
    <p>Prezado(a) gestor(a),</p>
    <p>Uma reserva foi cancelada pelo solicitante:</p>

    <ul>
        <li><strong>Título da Reserva:</strong> {{ $reserva->titulo }}</li>
        <li><strong>Espaço:</strong> {{ $reserva->horarios->first()->agenda->espaco->nome ?? 'N/A' }}</li>
        <li><strong>Cancelado por:</strong> {{ $canceler->name }}</li>
        <li><strong>Data/Horário:</strong>
            @foreach($reserva->horarios as $horario)
                <p>{{ \Carbon\Carbon::parse($horario->data)->format('d/m/Y') }} das {{ \Carbon\Carbon::parse($horario->horario_inicio)->format('H:i') }} às {{ \Carbon\Carbon::parse($horario->horario_fim)->format('H:i') }} (Turno: {{ $horario->agenda->turno }})</p>
            @endforeach
        </li>
    </ul>

    <p>Para visualizar a lista de reservas, clique no botão abaixo:</p>
    <a href="{{ $url }}" class="button">Ver Reservas</a>

    <p>Atenciosamente,</p>
    <p>Equipe UniEspaços</p>
@endsection
