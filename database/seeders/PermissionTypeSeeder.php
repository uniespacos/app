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
        PermissionType::firstOrCreate(
            ['id' => 3], // Find by 'id'
            ['nome' => 'Comum'] // Or create with these attributes
        );
        PermissionType::firstOrCreate(
            ['id' => 2],
            ['nome' => 'Gestor']
        );
        PermissionType::firstOrCreate(
            ['id' => 1],
            ['nome' => 'Institucional']
        );
    }
}
