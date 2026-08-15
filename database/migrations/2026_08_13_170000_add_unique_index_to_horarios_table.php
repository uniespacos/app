<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Impede que o mesmo slot seja gravado duas vezes na mesma reserva.
 *
 * Rede de seguranca de banco para a correcao feita nos jobs de criacao e
 * edicao: se algum caminho futuro inserir horarios sem passar pelo
 * ExpansaoHorariosService, o banco recusa na hora em vez de acumular linha
 * duplicada em silencio.
 *
 * PRE-REQUISITO: `php artisan reservas:clean-duplicates --force` ja executado.
 * Sem isso o indice nao pode ser criado, e a migracao aborta com instrucao em
 * vez de estourar um erro cru do Postgres.
 */
return new class extends Migration
{
    private const NOME_INDICE = 'horarios_unique_slot_per_reserva';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->abortarSeHouverDuplicatas();

        Schema::table('horarios', function (Blueprint $table) {
            $table->unique(['reserva_id', 'agenda_id', 'data', 'horario_inicio'], self::NOME_INDICE);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('horarios', function (Blueprint $table) {
            $table->dropUnique(self::NOME_INDICE);
        });
    }

    /**
     * Falha cedo e com instrucao acionavel: numa janela de deploy, "duplicate
     * key value violates unique constraint" nao diz o que fazer a seguir.
     */
    private function abortarSeHouverDuplicatas(): void
    {
        $duplicatas = DB::table('horarios')
            ->select('reserva_id', 'agenda_id', 'data', 'horario_inicio')
            ->groupBy('reserva_id', 'agenda_id', 'data', 'horario_inicio')
            ->havingRaw('count(*) > 1')
            ->get();

        if ($duplicatas->isEmpty()) {
            return;
        }

        throw new RuntimeException(sprintf(
            'Existem %d grupos de horarios duplicados. Rode `php artisan reservas:clean-duplicates --dry-run` '.
            'para auditar e `--force` para limpar antes de aplicar esta migracao.',
            $duplicatas->count()
        ));
    }
};
