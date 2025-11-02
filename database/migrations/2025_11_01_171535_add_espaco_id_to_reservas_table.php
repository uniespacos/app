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
            $table->foreignId('espaco_id')->nullable()->constrained('espacos')->onDelete('cascade');
            $table->foreignId('situacao_reserva_id')->nullable()->constrained('situacao_reservas')->onDelete('cascade');
            $table->uuid('solicitacao_uuid')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn([
                'espaco_id',
                'situacao_reserva_id',
                'solicitacao_uuid'
            ]);
        });
    }
};
