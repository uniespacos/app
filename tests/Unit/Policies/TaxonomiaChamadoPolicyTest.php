<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use App\Models\CategoriaChamado;
use App\Models\TipoChamado;
use App\Models\User;
use App\Policies\TaxonomiaChamadoPolicy;
use Tests\TestCase;

class TaxonomiaChamadoPolicyTest extends TestCase
{
    private TaxonomiaChamadoPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new TaxonomiaChamadoPolicy;
    }

    public function test_usuario_sem_permissao_nao_administra_taxonomias(): void
    {
        $user = User::factory()->create();
        $tipo = TipoChamado::factory()->create();

        $this->assertFalse($this->policy->viewAny($user));
        $this->assertFalse($this->policy->create($user));
        $this->assertFalse($this->policy->update($user, $tipo));
        $this->assertFalse($this->policy->delete($user, $tipo));
    }

    public function test_usuario_com_permissao_administra_taxonomias(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo([
            'taxonomias-chamado.listar',
            'taxonomias-chamado.criar',
            'taxonomias-chamado.atualizar',
            'taxonomias-chamado.deletar',
        ]);
        $user->refresh();

        $categoria = CategoriaChamado::factory()->create();

        $this->assertTrue($this->policy->viewAny($user));
        $this->assertTrue($this->policy->create($user));
        $this->assertTrue($this->policy->update($user, $categoria));
        $this->assertTrue($this->policy->delete($user, $categoria));
    }

    public function test_restaurar_e_apagar_definitivamente_ficam_sempre_negados(): void
    {
        $user = User::factory()->create();
        $user->assignRole('institucional');
        $user->refresh();

        $tipo = TipoChamado::factory()->create();

        $this->assertFalse($this->policy->restore($user, $tipo));
        $this->assertFalse($this->policy->forceDelete($user, $tipo));
    }
}
