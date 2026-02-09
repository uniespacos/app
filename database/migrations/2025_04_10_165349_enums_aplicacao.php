<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if we're using PostgreSQL before creating enums
        if (DB::getDriverName() === 'pgsql') {
            // Check if enum types exist before creating them
            $enumExists = DB::select("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'turno')")[0]->exists;
            if (! $enumExists) {
                DB::statement("CREATE TYPE turno AS ENUM ('manha', 'tarde', 'noite')");
            }

            $enumExists = DB::select("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'situacao')")[0]->exists;
            if (! $enumExists) {
                DB::statement("CREATE TYPE situacao AS ENUM ('em_analise', 'deferida', 'indeferida')");
            }

            $enumExists = DB::select("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dia_semana')")[0]->exists;
            if (! $enumExists) {
                DB::statement("CREATE TYPE dia_semana AS ENUM ('seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom')");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop enums (PostgreSQL)
        DB::statement('DROP TYPE IF EXISTS turno');
        DB::statement('DROP TYPE IF EXISTS situacao');
        DB::statement('DROP TYPE IF EXISTS dia_semana');
    }
};
