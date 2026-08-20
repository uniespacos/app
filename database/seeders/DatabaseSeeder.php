<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\Development\EspacoSeeder;
use Database\Seeders\Development\ReservaSeeder;
use Database\Seeders\Development\UserSeeder;
use Database\Seeders\Production\InstituicaoSeeder;
use Database\Seeders\Production\PermissionSeeder;
use Database\Seeders\Production\RoleSeeder;
use Database\Seeders\Production\SetorSeeder;
use Database\Seeders\Production\UnidadeSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // Production — dados reais do sistema
            PermissionSeeder::class,
            RoleSeeder::class,
            InstituicaoSeeder::class,
            UnidadeSeeder::class,
            SetorSeeder::class,

            // Development — dados de teste
            UserSeeder::class,
            EspacoSeeder::class,
            ReservaSeeder::class,
        ]);

        // Sincroniza as roles dos usuários nomeados de teste após EspacoSeeder
        // (que pode ter atribuído role 'gestor' extra a esses usuários).
        $namedUsers = [
            'institucional@gmail.com' => 'institucional',
            'gestor@gmail.com' => 'gestor',
            'comum@gmail.com' => 'comum',
        ];

        foreach ($namedUsers as $email => $role) {
            $user = User::where('email', $email)->first();
            $user?->syncRoles([$role]);
        }
    }
}
