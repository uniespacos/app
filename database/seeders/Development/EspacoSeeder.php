<?php

declare(strict_types=1);

namespace Database\Seeders\Development;

use App\Models\Espaco;
use Illuminate\Database\Seeder;

class EspacoSeeder extends Seeder
{
    public function run(): void
    {
        Espaco::factory()->count(5)->create();
    }
}
