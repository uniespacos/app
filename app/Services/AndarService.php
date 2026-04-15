<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Andar;
use App\Repositories\AndarRepositoryInterface;

class AndarService
{
    public function __construct(
        protected AndarRepositoryInterface $repoAndar,
    ) {}

    /**
     * Creates and persists a new floor.
     *
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): Andar
    {
        return $this->repoAndar->store($data);
    }
}
