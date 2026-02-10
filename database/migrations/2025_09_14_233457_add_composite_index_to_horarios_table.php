<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('horarios', function (Blueprint $table) {
            // Este índice acelera drasticamente a busca por data, agenda e situação
            $table->index(['data', 'agenda_id', 'situacao']);
        });
    }

    public function down(): void
    {
        Schema::table('horarios', function (Blueprint $table) {
            $table->dropIndex(['data', 'agenda_id', 'situacao']);
        });
    }
};
