<?php

declare(strict_types=1);

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\RelatorioServiceProvider;
use App\Providers\TelescopeServiceProvider;

return array_values(array_filter([
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    RelatorioServiceProvider::class,
    class_exists(\Laravel\Telescope\TelescopeApplicationServiceProvider::class) ? TelescopeServiceProvider::class : null,
]));
