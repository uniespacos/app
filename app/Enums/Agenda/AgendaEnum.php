<?php

declare(strict_types=1);

namespace App\Enums\Agenda;

enum AgendaEnum: string
{
    case MANHA = 'manha';
    case TARDE = 'tarde';
    case NOITE = 'noite';
}
