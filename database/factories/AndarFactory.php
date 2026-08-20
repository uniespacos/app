<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Andar;
use App\Models\Modulo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Andar>
 */
class AndarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // A vírgula dupla foi removida desta linha
            'nome' => 'terreo',
            'tipo_acesso' => $this->faker->randomElements(['escada', 'elevador', 'rampa'], 2),
            'modulo_id' => Modulo::factory(),
        ];
    }
}
