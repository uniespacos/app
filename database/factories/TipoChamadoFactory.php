<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\TipoChamado;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TipoChamado>
 */
class TipoChamadoFactory extends Factory
{
    protected $model = TipoChamado::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nome = $this->faker->unique()->words(2, true);

        return [
            'nome' => Str::ucfirst($nome),
            'slug' => Str::slug($nome),
            'descricao' => $this->faker->sentence(),
            'ordem' => $this->faker->unique()->numberBetween(1, 999),
            'exibe_alerta_espaco' => false,
        ];
    }

    /**
     * Tipo cujos chamados entram no alerta da tela de reserva.
     */
    public function comAlerta(): static
    {
        return $this->state(fn (array $attributes): array => [
            'exibe_alerta_espaco' => true,
        ]);
    }
}
