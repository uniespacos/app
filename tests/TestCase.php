<?php

namespace Tests;

use App\Models\PermissionType;
use Database\Seeders\PermissionTypeSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        if (method_exists($this, 'withoutVite')) {
            $this->withoutVite();
        }

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

        // Se a tabela permission_types estiver vazia, roda o seeder.
        // Isso garante que os dados essenciais (como permission_type_id = 3) existam.
        if (PermissionType::count() === 0) {
            $this->seed(PermissionTypeSeeder::class);
        }

        // $this->seed(DatabaseSeeder::class); // Removed to prevent wiping/reseeding on every test
    }
}
