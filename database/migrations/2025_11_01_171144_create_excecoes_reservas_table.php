<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('excecoes_reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('regra_reserva_id')->constrained('regras_reservas')->onDelete('cascade');
            $table->date('data_excecao');
            $table->enum('tipo_excecao', [
                'CANCELADO_USUARIO',
                'CANCELADO_GESTOR',
                'ESPACO_INDISPONIVEL'
            ]);
            $table->text('justificativa')->nullable();
            $table->foreignId('criado_por')->constrained('users')->onDelete('cascade');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('excecoes_reservas');
    }
};
