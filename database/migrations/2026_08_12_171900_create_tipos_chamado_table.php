<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tipos_chamado', function (Blueprint $table) {
            $table->id();

            $table->string('nome');
            $table->string('slug');
            $table->string('descricao')->nullable();
            $table->unsignedSmallInteger('ordem')->default(0);

            $table->boolean('exibe_alerta_espaco')->default(false);

            $table->softDeletes();
            $table->timestamps();
        });

        DB::statement('CREATE UNIQUE INDEX tipos_chamado_slug_unique ON tipos_chamado (slug) WHERE deleted_at IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS tipos_chamado_slug_unique');

        Schema::dropIfExists('tipos_chamado');
    }
};
