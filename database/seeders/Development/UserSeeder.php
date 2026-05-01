<?php

declare(strict_types=1);

namespace Database\Seeders\Development;

use App\Models\Setor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'name' => 'Institucional',
            'email' => 'institucional@gmail.com',
            'email_verified_at' => now(),
            'profile_pic' => fake()->name(),
            'telefone' => fake()->phoneNumber(),
            'password' => Hash::make('123123123'),
            'setor_id' => Setor::pluck('id')->random(),
            'remember_token' => Str::random(10),
        ]);

        $user->assignRole('institucional');

        User::factory()->count(10)->create([
            'password' => Hash::make('123123123'),
        ])->each(function (User $user) {
            $user->assignRole('comum');
        });
    }
}
