<?php

namespace Database\Factories;

use App\Models\Instituicao;
use App\Models\Setor;
use App\Models\Unidade;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Unidade>
 */
class UnidadeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => 'Unidade '.$this->faker->city(),
            'sigla' => $this->faker->unique()->lexify('??'),
            'instituicao_id' => Instituicao::factory(),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (Unidade $unidade) {
            // 2. Cria de 2 a 5 setores para cada unidade criada
            Setor::factory()->count(rand(2, 5))->create([
                'unidade_id' => $unidade->id,
            ]);
        });
    }
}
