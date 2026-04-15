<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Modulo;
use Illuminate\Database\Seeder;

class ModuloSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Modulo::create([
            'nome' => 'Administrativo',
            'unidade_id' => '1',
        ]);
        Modulo::create([
            'nome' => 'Joselia Navarro',
            'unidade_id' => '1',
        ]);
        Modulo::create([
            'nome' => 'Laboratórios',
            'unidade_id' => '1',
        ]);
        Modulo::create([
            'nome' => 'CPDS',
            'unidade_id' => '1',
        ]);
    }
}
