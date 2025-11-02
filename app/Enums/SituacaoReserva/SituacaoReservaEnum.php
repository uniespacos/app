<?php

namespace App\Enums\SituacaoReserva;


enum SituacaoReservaEnum: string
{
    case EM_ANALISE = 'em-analise';
    case INDEFERIDA = 'indeferida';
    case PARCIALMENTE_DEFERIDA = 'parcialmente-deferida';
    case DEFERIDA = 'deferida';
    case INATIVA = 'inativa';
}
