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
        Schema::create('espacos', function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->string('nome');
            $table->integer('capacidade_pessoas');
            $table->string('descricao');
            $table->json('imagens')->nullable();
            $table->string('main_image_index')->nullable();
            $table->foreignId('andar_id')->constrained('andars')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('espacos');
    }
};
