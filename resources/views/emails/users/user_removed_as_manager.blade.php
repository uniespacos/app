@extends('emails.layout')

@section('content')
    <p>Prezado(a) {{ $user->name }},</p>

    @if($espacoNome && $turno)
        <p>Você foi removido(a) como gestor(a) do espaço <strong>'{{ $espacoNome }}'</strong> para o turno <strong>'{{ $turno }}'</strong>.</p>
        <p>Você não é mais responsável por avaliar as solicitações de reserva para este espaço neste turno.</p>
        <p>Para visualizar seus espaços, clique no botão abaixo:</p>
        <div class="cta-container"><a href="{{ $url }}" class="button">Ver Meus Espaços</a></div>
    @else
        <p>Você foi removido(a) como gestor(a) de agenda em nosso sistema.</p>
        <p>Você não possui mais permissões de gestão de agendas ou espaços.</p>
        <p>Para acessar a página inicial, clique no botão abaixo:</p>
        <div class="cta-container"><a href="{{ $url }}" class="button">Ir para a Página Inicial</a></div>
    @endif

    <p>Atenciosamente,</p>
    <p>Equipe UniEspaços</p>
@endsection
