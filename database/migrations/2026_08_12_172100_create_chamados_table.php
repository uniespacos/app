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

            // Protocolo publico: e o que o reportante anonimo recebe na tela de sucesso.
            $table->ulid('protocolo')->unique();

            // Alvo polimorfico. Nesta entrega apenas Espaco e usado;
            // Equipamento entra quando o modulo de inventario existir.
            $table->morphs('reportable');

            $table->enum('tipo', ['defeito', 'reclamacao', 'sugestao'])->default('defeito');
            $table->enum('categoria', ['eletrica', 'hidraulica', 'mobiliario', 'ti', 'limpeza', 'outros']);
            $table->text('descricao');
            $table->enum('status', ['aberto', 'em_andamento', 'resolvido', 'cancelado'])->default('aberto');

            // Contato opcional do reportante anonimo.
            $table->string('contato_nome')->nullable();
            $table->string('contato_email')->nullable();

            // Fotos do problema (paths no disco public).
            $table->json('fotos')->nullable();

            $table->foreignId('resolvido_por')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolvido_em')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
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
