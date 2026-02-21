@extends('emails.layout')

@section('content')
    <p>Prezado(a) {{ $manager->name }},</p>

    @if($espacoNome && $turno)
        <p>Você foi designado(a) como gestor(a) do espaço <strong>'{{ $espacoNome }}'</strong> para o turno <strong>'{{ $turno }}'</strong>.</p>
        <p>A partir de agora, você é responsável por avaliar as solicitações de reserva para este espaço neste turno.</p>
        <p>Para gerenciar este espaço, clique no botão abaixo:</p>
        <a href="{{ $url }}" class="button">Gerenciar Espaço</a>
    @else
        <p>Você foi designado(a) como gestor(a) de agenda em nosso sistema.</p>
        <p>A partir de agora, você pode gerenciar agendas e espaços que lhe foram atribuídos.</p>
        <p>Para acessar o painel de gestão de espaços, clique no botão abaixo:</p>
        <a href="{{ $url }}" class="button">Acessar Painel de Gestão</a>
    @endif

    <p>Atenciosamente,</p>
    <p>Equipe UniEspaços</p>
@endsection
