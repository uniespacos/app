@extends('emails.layout')

@section('content')
    <p>Prezado(a) {{ $reserva->user->name }},</p>
    <p>Sua reserva para <strong>'{{ $reserva->titulo }}'</strong> foi atualizada com sucesso.</p>

    <ul>
        <li><strong>Título da Reserva:</strong> {{ $reserva->titulo }}</li>
        <li><strong>Espaço:</strong> {{ $reserva->horarios->first()->agenda->espaco->nome ?? 'N/A' }}</li>
        <li><strong>Data/Horário:</strong>
            @foreach($reserva->horarios as $horario)
                <p>{{ \Carbon\Carbon::parse($horario->data)->format('d/m/Y') }} das {{ \Carbon\Carbon::parse($horario->horario_inicio)->format('H:i') }} às {{ \Carbon\Carbon::parse($horario->horario_fim)->format('H:i') }} (Turno: {{ $horario->agenda->turno }})</p>
            @endforeach
        </li>
        <li><strong>Status Atual:</strong> {{ $reserva->situacao_formatada }}</li>
    </ul>

    <p>Para visualizar os detalhes completos da sua reserva, clique no botão abaixo:</p>
    <a href="{{ $url }}" class="button">Ver Detalhes da Reserva</a>

    <p>Atenciosamente,</p>
    <p>Equipe UniEspaços</p>
@endsection
