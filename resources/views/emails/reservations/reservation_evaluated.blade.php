@extends('emails.layout')

@section('content')
    <p>Prezado(a) {{ $reserva->user->name }},</p>
    <p>Sua reserva para <strong>'{{ $reserva->titulo }}'</strong> foi avaliada.</p>

    <p><strong>Status da Avaliação:</strong> {{ ucfirst($statusAvaliacao) }}</p>

    @if($reserva->observacao)
        <p><strong>Observações do Gestor:</strong> {{ $reserva->observacao }}</p>
    @endif

    <p>Para visualizar os detalhes completos da sua reserva, clique no botão abaixo:</p>
    <a href="{{ $url }}" class="button">Ver Detalhes da Reserva</a>

    <p>Atenciosamente,</p>
    <p>Equipe UniEspaços</p>
@endsection
