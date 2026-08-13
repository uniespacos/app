<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Cria a coluna como nullable para nao quebrar as linhas existentes.
        Schema::table('espacos', function (Blueprint $table) {
            $table->ulid('public_id')->nullable()->after('id');
        });

        // 2. Backfill: gera um ULID para cada espaco ja cadastrado.
        DB::table('espacos')->whereNull('public_id')->orderBy('id')->each(function ($espaco) {
            DB::table('espacos')
                ->where('id', $espaco->id)
                ->update(['public_id' => (string) Str::ulid()]);
        });

        // 3. Agora que toda linha tem valor, trava a coluna e indexa.
        Schema::table('espacos', function (Blueprint $table) {
            $table->ulid('public_id')->nullable(false)->change();
            $table->unique('public_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('espacos', function (Blueprint $table) {
            $table->dropUnique(['public_id']);
            $table->dropColumn('public_id');
        });
    }
};
