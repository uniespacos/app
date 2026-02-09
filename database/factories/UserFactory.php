<?php

namespace Database\Factories;

use App\Models\Setor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'telefone' => fake()->phoneNumber(),
            'profile_pic' => '[https://placehold.co/400x400/000000/FFFFFF?text=](https://placehold.co/400x400/000000/FFFFFF?text=)'.fake()->lexify('??'),
            'permission_type_id' => 3, // Seleciona um tipo de permissão aleatório
            'setor_id' => null, // Por padrão, o usuário não tem setor.
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the user belongs to a setor.
     */
    public function withSetor(): static
    {
        return $this->state(fn (array $attributes) => [
            'setor_id' => Setor::factory(),
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
