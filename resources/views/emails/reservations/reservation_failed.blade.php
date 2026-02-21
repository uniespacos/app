@extends('emails.layout')

@section('content')
    <p>Prezado(a) {{ $user->name }},</p>
    <p>Houve um erro ao processar sua solicitação de reserva para <strong>'{{ $reservationTitle }}'</strong>.</p>

    <p>Pedimos desculpas pelo inconveniente. Por favor, tente novamente ou entre em contato com o suporte técnico se o problema persistir.</p>

    <p>Para visualizar suas reservas, clique no botão abaixo:</p>
    <a href="{{ $url }}" class="button">Minhas Reservas</a>

    <p>Atenciosamente,</p>
    <p>Equipe UniEspaços</p>
@endsection
