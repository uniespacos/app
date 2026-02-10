<?php

namespace Database\Factories;

use App\Models\Unidade;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Setor>
 */
class SetorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => 'Setor de '.$this->faker->jobTitle(),
            'sigla' => $this->faker->unique()->lexify('???'),
            'unidade_id' => Unidade::factory(),
        ];
    }
}
