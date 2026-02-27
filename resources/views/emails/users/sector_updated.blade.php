@extends('emails.layout')

@section('content')
    <p>Prezado(a) {{ $user->name }},</p>
    <p>O setor ao qual você pertence, <strong>'{{ $setor->nome }}'</strong>, foi atualizado em nosso sistema.</p>

    <p>As informações do setor podem ter sido alteradas. Por favor, verifique se há alguma mudança que possa impactar suas atividades.</p>

    <p>Para visualizar os detalhes do setor, clique no botão abaixo:</p>
    <div class="cta-container"><a href="{{ $url }}" class="button">Ver Detalhes do Setor</a></div>

    <p>Atenciosamente,</p>
    <p>Equipe UniEspaços</p>
@endsection
