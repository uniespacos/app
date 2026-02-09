<?php

namespace Database\Seeders;

use App\Models\PermissionType;
use Illuminate\Database\Seeder;

class PermissionTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PermissionType::create([
            'id' => 3,
            'nome' => 'Comum',
        ]);
        PermissionType::create([
            'id' => 2,
            'nome' => 'Gestor',
        ]);
        PermissionType::create([
            'id' => 1,
            'nome' => 'Institucional',
        ]);
    }
}
