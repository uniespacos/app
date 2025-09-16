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
        Schema::table('reservas', function (Blueprint $table) {
            $table->index('user_id');
            $table->index(['data_inicial', 'data_final']); // Um índice composto pode ser útil aqui
        });

        Schema::table('horarios', function (Blueprint $table) {
            $table->index('reserva_id');
            $table->index('agenda_id');
            $table->index('data'); // ESSENCIAL para o filtro whereBetween
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['data_inicial', 'data_final']);
        });

        Schema::table('horarios', function (Blueprint $table) {
            $table->dropIndex(['reserva_id']);
            $table->dropIndex(['agenda_id']);
            $table->dropIndex(['data']);
        });
    }
};