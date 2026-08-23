<?php

declare(strict_types=1);

namespace Database\Seeders\Production;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app()->make(PermissionRegistrar::class)->forgetCachedPermissions();

        $institucional = Role::firstOrCreate(
            ['name' => 'institucional', 'guard_name' => 'web'],
            ['is_system' => true]
        );

        $gestor = Role::firstOrCreate(
            ['name' => 'gestor', 'guard_name' => 'web'],
            ['is_system' => true]
        );

        Role::firstOrCreate(
            ['name' => 'comum', 'guard_name' => 'web'],
            ['is_system' => true]
        );

        $institucional->syncPermissions(
            Permission::where('guard_name', 'web')
                ->where('name', '!=', 'reservas.deletar')
                ->pluck('name')
                ->toArray()
        );

        $gestor->syncPermissions([
            'usuarios.listar',
            'usuarios.visualizar',
            'reservas.avaliar',
            'secao.dashboard-gestor',
            'secao.gestao-reservas',
            'relatorios.reservas-periodo',
            'relatorios.ocupacao-espacos',
            'relatorios.inventario-espacos',
            'secao.relatorios',
        ]);
    }
}
