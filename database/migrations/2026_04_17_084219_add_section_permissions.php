<?php

declare(strict_types=1);

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    private const SECTION_PERMISSIONS = [
        'secao.dashboard-institucional',
        'secao.dashboard-gestor',
        'secao.gestao-reservas',
        'secao.gestao-espacos',
        'secao.gestao-usuarios',
        'secao.gestao-instituicoes',
        'secao.gestao-unidades',
        'secao.gestao-modulos',
        'secao.gestao-setores',
        'secao.gestao-roles',
    ];

    public function up(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (self::SECTION_PERMISSIONS as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $institucional = Role::findByName('institucional', 'web');
        $gestor = Role::findByName('gestor', 'web');

        $institucional->givePermissionTo(self::SECTION_PERMISSIONS);

        $gestor->givePermissionTo([
            'secao.dashboard-gestor',
            'secao.gestao-reservas',
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $institucional = Role::findByName('institucional', 'web');
        $gestor = Role::findByName('gestor', 'web');

        $institucional->revokePermissionTo(self::SECTION_PERMISSIONS);
        $gestor->revokePermissionTo(['secao.dashboard-gestor', 'secao.gestao-reservas']);

        Permission::whereIn('name', self::SECTION_PERMISSIONS)->delete();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
