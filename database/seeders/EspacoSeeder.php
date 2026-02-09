<?php

namespace Database\Seeders;

use App\Models\Espaco;
use Illuminate\Database\Seeder;

class EspacoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Espaco::factory(10)->create();
    }
}
