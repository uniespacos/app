<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('regras_reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reserva_id')->constrained('reservas')->onDelete('cascade');
            $table->foreignId('agenda_id')->constrained('agendas')->onDelete('cascade');
            $table->enum(
                'dia_semana',
                [
                    "SEG",
                    "TER",
                    "QUA",
                    "QUI",
                    "SEX",
                    "SAB",
                    "DOM"
                ]
            );
            $table->time('hora_inicio');
            $table->time('hora_fim');
            $table->foreignId('situacao_id')->constrained('situacao_reservas')->onDelete('cascade');
            $table->text('justificativa');
            $table->foreignId('avaliador_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('regras_reserva');
    }
};
