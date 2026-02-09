<?php

namespace Database\Seeders;

use App\Models\Setor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Institucional',
            'email' => 'institucional@gmail.com',
            'email_verified_at' => now(),
            'profile_pic' => fake()->name(),
            'telefone' => fake()->phoneNumber(),
            'password' => Hash::make('123123123'),
            'setor_id' => Setor::pluck('id')->random(),
            'remember_token' => Str::random(10),
            'permission_type_id' => 3,
        ]);
    }
}
