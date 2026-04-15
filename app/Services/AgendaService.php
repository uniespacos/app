<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\AgendaRepositoryInterface;

class AgendaService
{
    public function __construct(
        protected AgendaRepositoryInterface $repoAgenda,
    ) {}
}
