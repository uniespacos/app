<?php

namespace Database\Factories;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Reserva>
 */
class ReservaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dataInicial = $this->faker->dateTimeBetween('now', '+2 months');
        $dataFinal = Carbon::instance($dataInicial)->addHours($this->faker->numberBetween(1, 4));

        return [
            'titulo' => $this->faker->sentence(4),
            'descricao' => $this->faker->text(200),
            'situacao' => 'em_analise',
            'data_inicial' => $dataInicial,
            'data_final' => $dataFinal,
            'recorrencia' => 'unica',
            'observacao' => $this->faker->optional()->sentence,
            'user_id' => User::factory(),
        ];
    }
}
