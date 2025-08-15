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
        Schema::create('reservas', function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->string('titulo');
            $table->text('descricao');
            $table->enum('situacao', ['em_analise', 'parcialmente_deferida', 'deferida', 'indeferida', 'inativa'])->default('em_analise');;
            $table->dateTime('data_inicial');
            $table->dateTime('data_final');
            $table->enum('recorrencia', ['unica', '15dias', '1mes', 'personalizado'])->default('unica');
            $table->text('observacao')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
