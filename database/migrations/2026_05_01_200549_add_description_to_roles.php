<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Schema::table('roles', fn (Blueprint $table) => $table->string('description', 500)->nullable()->after('name'));

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Schema::table('roles', fn (Blueprint $table) => $table->dropColumn('description'));

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
