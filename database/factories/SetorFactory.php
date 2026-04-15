<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Setor;
use App\Models\Unidade;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Setor>
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
