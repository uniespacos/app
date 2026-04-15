<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Modulo;
use App\Models\Unidade;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Modulo>
 */
class ModuloFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => 'Módulo '.$this->faker->randomElement(['Acadêmico', 'Administrativo', 'Laboratórios']),
            'unidade_id' => Unidade::pluck('id')->random(),
        ];
    }
}
