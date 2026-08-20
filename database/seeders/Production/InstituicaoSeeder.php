<?php

declare(strict_types=1);

namespace Database\Seeders\Production;

use App\Models\Instituicao;
use Illuminate\Database\Seeder;

class InstituicaoSeeder extends Seeder
{
    public function run(): void
    {
        Instituicao::create([
            'nome' => 'Universidade Estadual do Sudoeste da Bahia',
            'sigla' => 'UESB',
        ]);
        Instituicao::create([
            'nome' => 'Outra Instituição',
            'sigla' => 'outra',
        ]);
        Instituicao::create([
            'nome' => 'Nenhuma',
            'sigla' => 'nenhuma',
        ]);
    }
}
