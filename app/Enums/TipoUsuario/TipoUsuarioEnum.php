<?php

declare(strict_types=1);

namespace App\Enums\TipoUsuario;

enum TipoUsuarioEnum: string
{
    case SETOR = 'setor';
    case PROFESSOR = 'professor';
    case ALUNO = 'aluno';
    case EXTERNO = 'externo';
}
