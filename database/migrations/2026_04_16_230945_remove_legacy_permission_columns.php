<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['permission_type_id']);
            $table->dropColumn('permission_type_id');
        });

        Schema::dropIfExists('permission_types');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('permission_types', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->timestamps();
        });

        DB::table('permission_types')->insert([
            ['id' => 1, 'nome' => 'Institucional', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nome' => 'Gestor', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'nome' => 'Comum', 'created_at' => now(), 'updated_at' => now()],
        ]);

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('permission_type_id')->default(3)->constrained('permission_types');
        });

        $rolePriority = [
            'comum' => 3,
            'gestor' => 2,
            'institucional' => 1,
        ];

        foreach ($rolePriority as $roleName => $permissionTypeId) {
            $userIds = DB::table('model_has_roles')
                ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
                ->where('roles.name', $roleName)
                ->where('model_has_roles.model_type', User::class)
                ->pluck('model_has_roles.model_id');

            if ($userIds->isNotEmpty()) {
                DB::table('users')
                    ->whereIn('id', $userIds)
                    ->update(['permission_type_id' => $permissionTypeId]);
            }
        }
    }
};
