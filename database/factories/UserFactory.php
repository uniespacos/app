<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Setor;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
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
        // Garante que existe pelo menos um setor antes de tentar buscar um ID aleatório.
        if (Setor::count() === 0) {
            Setor::factory()->create();
        }

        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'telefone' => fake()->phoneNumber(),
            'profile_pic' => '[https://placehold.co/400x400/000000/FFFFFF?text=](https://placehold.co/400x400/000000/FFFFFF?text=)'.fake()->lexify('??'),
            'setor_id' => Setor::pluck('id')->random(),
            'remember_token' => Str::random(10),
        ];
    }

    public function comRole(string $roleName): static
    {
        return $this->afterCreating(function (User $user) use ($roleName) {
            $user->assignRole($roleName);
        });
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
