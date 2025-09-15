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
            // Adiciona as colunas
            $table->string('validation_status')->default('pending')->after('situacao');
            $table->json('conflict_cache')->nullable()->after('validation_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            // Remove as mesmas colunas
            $table->dropColumn(['validation_status', 'conflict_cache']);
        });
    }
};