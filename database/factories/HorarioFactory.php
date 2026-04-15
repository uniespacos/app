<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Agenda;
use App\Models\Horario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Horario>
 */
class HorarioFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        return [
            'agenda_id' => Agenda::factory(),
            'horario_inicio' => $this->faker->time('H:00:00'),
            'horario_fim' => $this->faker->time('H:00:00'),
            'data' => $this->faker->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
        ];
    }
}
