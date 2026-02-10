<?php

namespace Database\Seeders;

use App\Models\Instituicao;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstituicaoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('instituicaos')->insert([
            'nome' => 'Universidade Estadual do Sudoeste da Bahia',
            'sigla' => 'UESB',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('instituicaos')->insert([
            'nome' => 'Outra Instituição',
            'sigla' => 'outra',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('instituicaos')->insert([
            'nome' => 'Nenhuma',
            'sigla' => 'nenhuma',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        Instituicao::factory()->count(10)->create([
            'endereco' => 'Endereço padrão',
        ]);
    }
}
