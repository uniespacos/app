<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

// Dependency: Must run BEFORE 2026_04_16_230945_remove_legacy_permission_columns.php
// This migration uses permission_type_id column to migrate users to roles.
// The remove_legacy migration will drop permission_type_id after this migration completes.
return new class extends Migration
{
    private const PERMISSIONS = [
        'usuarios.listar', 'usuarios.visualizar', 'usuarios.criar',
        'usuarios.atualizar', 'usuarios.deletar', 'usuarios.gerenciar-permissoes',
        'espacos.listar', 'espacos.visualizar', 'espacos.criar', 'espacos.atualizar', 'espacos.deletar', 'espacos.alterar-gestores',
        'reservas.listar', 'reservas.visualizar', 'reservas.atualizar', 'reservas.deletar', 'reservas.avaliar',
        'instituicoes.listar', 'instituicoes.visualizar', 'instituicoes.criar', 'instituicoes.atualizar', 'instituicoes.deletar',
        'unidades.listar', 'unidades.visualizar', 'unidades.criar', 'unidades.atualizar', 'unidades.deletar',
        'modulos.listar', 'modulos.visualizar', 'modulos.criar', 'modulos.atualizar', 'modulos.deletar',
        'setores.listar', 'setores.visualizar', 'setores.criar', 'setores.atualizar', 'setores.deletar',
        'andares.criar', 'andares.atualizar',
        'sistema.telescope',
    ];

    public function up(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $institucional = Role::firstOrCreate(['name' => 'institucional', 'guard_name' => 'web'], ['is_system' => true]);
        $gestor = Role::firstOrCreate(['name' => 'gestor',        'guard_name' => 'web'], ['is_system' => true]);
        $comum = Role::firstOrCreate(['name' => 'comum',         'guard_name' => 'web'], ['is_system' => true]);

        $institucional->syncPermissions(Permission::all());
        $gestor->syncPermissions(['usuarios.listar', 'usuarios.visualizar', 'reservas.avaliar']);

        User::where('permission_type_id', 1)->each(fn ($u) => $u->assignRole('institucional'));
        User::where('permission_type_id', 2)->each(fn ($u) => $u->assignRole('gestor'));
        User::where('permission_type_id', 3)->each(fn ($u) => $u->assignRole('comum'));

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        DB::table('model_has_roles')->delete();
        DB::table('role_has_permissions')->delete();
        DB::table('roles')->whereIn('name', ['institucional', 'gestor', 'comum'])->delete();
        DB::table('permissions')->whereIn('name', self::PERMISSIONS)->delete();
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
