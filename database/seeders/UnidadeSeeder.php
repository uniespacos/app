<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnidadeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('unidades')->insert([
            'nome' => 'Campus Jequié',
            'sigla' => 'JQ',
            'instituicao_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('unidades')->insert([
            'nome' => 'Campus Vitória da Conquista',
            'sigla' => 'VCA',
            'instituicao_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('unidades')->insert([
            'nome' => 'Campus Itapetinga',
            'sigla' => 'ITA',
            'instituicao_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
