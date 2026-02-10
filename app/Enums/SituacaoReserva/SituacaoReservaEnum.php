<?php

namespace App\Enums\SituacaoReserva;

enum SituacaoReservaEnum: string
{
    case EM_ANALISE = 'em_analise';
    case INDEFERIDA = 'indeferida';
    case PARCIALMENTE_DEFERIDA = 'parcialmente_deferida';
    case DEFERIDA = 'deferida';
    case INATIVA = 'inativa';
}
