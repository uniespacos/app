<?php

declare(strict_types=1);

namespace Database\Seeders\Production;

use App\Models\CategoriaChamado;
use App\Models\TipoChamado;
use Illuminate\Database\Seeder;

class TaxonomiaChamadoSeeder extends Seeder
{
    /**
     * @var list<array{slug: string, nome: string, descricao: string, ordem: int, exibe_alerta_espaco: bool}>
     */
    private const TIPOS = [
        [
            'slug' => 'defeito',
            'nome' => 'Defeito',
            'descricao' => 'Algo quebrado ou fora de funcionamento',
            'ordem' => 1,
            'exibe_alerta_espaco' => true,
        ],
        [
            'slug' => 'reclamacao',
            'nome' => 'Reclamação',
            'descricao' => 'Insatisfação com o espaço ou com o atendimento',
            'ordem' => 2,
            'exibe_alerta_espaco' => false,
        ],
        [
            'slug' => 'sugestao',
            'nome' => 'Sugestão',
            'descricao' => 'Ideia de melhoria para o espaço',
            'ordem' => 3,
            'exibe_alerta_espaco' => false,
        ],
    ];

    /**
     * @var list<array{slug: string, nome: string, descricao: string, ordem: int}>
     */
    private const CATEGORIAS = [
        [
            'slug' => 'eletrica',
            'nome' => 'Elétrica',
            'descricao' => 'Lâmpada, tomada, ar-condicionado',
            'ordem' => 1,
        ],
        [
            'slug' => 'hidraulica',
            'nome' => 'Hidráulica',
            'descricao' => 'Torneira, vazamento, descarga',
            'ordem' => 2,
        ],
        [
            'slug' => 'mobiliario',
            'nome' => 'Mobiliário',
            'descricao' => 'Carteira, mesa, cadeira, porta',
            'ordem' => 3,
        ],
        [
            'slug' => 'ti',
            'nome' => 'Informática',
            'descricao' => 'Computador, projetor, rede',
            'ordem' => 4,
        ],
        [
            'slug' => 'limpeza',
            'nome' => 'Limpeza',
            'descricao' => 'Sala suja, lixo acumulado',
            'ordem' => 5,
        ],
        [
            'slug' => 'outros',
            'nome' => 'Outros',
            'descricao' => 'Outro tipo de problema',
            'ordem' => 6,
        ],
    ];

    public function run(): void
    {
        foreach (self::TIPOS as $tipo) {
            TipoChamado::firstOrCreate(
                ['slug' => $tipo['slug']],
                [
                    'nome' => $tipo['nome'],
                    'descricao' => $tipo['descricao'],
                    'ordem' => $tipo['ordem'],
                    'exibe_alerta_espaco' => $tipo['exibe_alerta_espaco'],
                ]
            );
        }

        foreach (self::CATEGORIAS as $categoria) {
            CategoriaChamado::firstOrCreate(
                ['slug' => $categoria['slug']],
                [
                    'nome' => $categoria['nome'],
                    'descricao' => $categoria['descricao'],
                    'ordem' => $categoria['ordem'],
                ]
            );
        }
    }
}
