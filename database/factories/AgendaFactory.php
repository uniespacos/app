<?php

namespace Database\Factories;

use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Agenda>
 */
class AgendaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // O turno será definido pelo EspacoFactory, mas aqui fica um padrão.
            'turno' => $this->faker->randomElement(['manha', 'tarde', 'noite']),
            'espaco_id' => Espaco::factory(),
            // A agenda pode ou não ter um usuário responsável inicialmente.
            'user_id' => User::pluck('id')->random(), // Se não houver usuários, será null
        ];
    }
}
