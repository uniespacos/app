<?php

declare(strict_types=1);

namespace Database\Seeders\Production;

use App\Models\Instituicao;
use App\Models\Unidade;
use Illuminate\Database\Seeder;

class UnidadeSeeder extends Seeder
{
    public function run(): void
    {
        $uesb = Instituicao::where('sigla', 'UESB')->firstOrFail();

        Unidade::create([
            'nome' => 'Campus Jequié',
            'sigla' => 'JQ',
            'instituicao_id' => $uesb->id,
        ]);
        Unidade::create([
            'nome' => 'Campus Vitória da Conquista',
            'sigla' => 'VCA',
            'instituicao_id' => $uesb->id,
        ]);
        Unidade::create([
            'nome' => 'Campus Itapetinga',
            'sigla' => 'ITA',
            'instituicao_id' => $uesb->id,
        ]);
    }
}
