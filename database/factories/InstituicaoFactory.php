<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Instituicao;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Instituicao>
 */
class InstituicaoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => $this->faker->company().' '.$this->faker->companySuffix(),
            'sigla' => $this->faker->unique()->lexify('???'),
            'endereco' => $this->faker->address(),
        ];
    }
}
