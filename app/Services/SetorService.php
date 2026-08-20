<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setor;
use App\Notifications\SectorUpdatedNotification;
use App\Repositories\SetorRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SetorService
{
    public function __construct(
        protected SetorRepositoryInterface $repoSetor,
    ) {}

    /**
     * Returns all sectors belonging to the given institution.
     *
     * @return Collection<int, Setor>
     */
    public function getAllByInstituicao(int $instituicaoId): Collection
    {
        return $this->repoSetor->getAllByInstituicao($instituicaoId);
    }

    /**
     * Creates and persists a new sector.
     *
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): Setor
    {
        return $this->repoSetor->store($data);
    }

    /**
     * Updates an existing sector and notifies its users.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Setor $setor, array $data): Setor
    {
        $setor = $this->repoSetor->update($data, $setor->id);
        $setor->load(['users']);

        foreach ($setor->users as $user) {
            $user->notify(new SectorUpdatedNotification($setor, $user));
        }

        return $setor;
    }

    /**
     * Deletes the given sector from the database.
     */
    public function delete(Setor $setor): bool
    {
        return $this->repoSetor->destroy($setor->id);
    }
}
