<?php

declare(strict_types=1);

namespace Tests\Concerns;

use Illuminate\Support\Facades\DB;

/**
 * Libera a criacao de horarios duplicados dentro de um teste.
 *
 * Depois do indice `horarios_unique_slot_per_reserva`, duplicata virou estado
 * impossivel no banco — o que e justamente o objetivo. Mas alguns testes
 * precisam montar esse cenario de proposito: o do comando de limpeza (que
 * existe para remove-las) e o da taxa de ocupacao (que prova que repeticao nao
 * infla o indicador).
 *
 * O DDL do Postgres e transacional e a suite roda cada teste dentro de uma
 * transacao, entao a constraint volta sozinha no rollback — nenhum teste
 * seguinte fica sem a protecao.
 */
trait PermiteHorariosDuplicados
{
    protected function permitirHorariosDuplicados(): void
    {
        DB::statement('ALTER TABLE horarios DROP CONSTRAINT IF EXISTS horarios_unique_slot_per_reserva');
    }
}
