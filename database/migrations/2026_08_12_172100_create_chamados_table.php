<?php

declare(strict_types=1);

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
        Schema::create('chamados', function (Blueprint $table) {
            $table->id()->autoIncrement();

            $table->ulid('protocolo')->unique();

            $table->morphs('reportable');

            $table->foreignId('tipo_id')->constrained('tipos_chamado')->restrictOnDelete();
            $table->foreignId('categoria_id')->constrained('categorias_chamado')->restrictOnDelete();
            $table->text('descricao');
            $table->enum('status', ['aberto', 'em_andamento', 'resolvido', 'cancelado'])->default('aberto');

            $table->string('contato_nome')->nullable();
            $table->string('contato_email')->nullable();

            $table->json('fotos')->nullable();

            $table->foreignId('resolvido_por')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolvido_em')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
            $table->index('tipo_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chamados');
    }
};
