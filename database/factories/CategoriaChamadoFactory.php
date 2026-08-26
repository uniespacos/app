<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CategoriaChamado;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CategoriaChamado>
 */
class CategoriaChamadoFactory extends Factory
{
    protected $model = CategoriaChamado::class;

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
        ];
    }
}
