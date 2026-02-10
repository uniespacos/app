<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('horarios', function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->foreignId('agenda_id')->constrained('agendas')->onDelete('cascade');
            $table->foreignId('reserva_id')->constrained('reservas')->onDelete('cascade');
            $table->time('horario_inicio');
            $table->time('horario_fim');
            $table->date('data');
            $table->enum('situacao', ['em_analise', 'deferida', 'indeferida', 'inativa'])->default('em_analise');
            $table->text('justificativa')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('horarios');
    }
};
