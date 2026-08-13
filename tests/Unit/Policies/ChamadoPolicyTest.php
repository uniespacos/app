<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use App\Models\Chamado;
use App\Models\Espaco;
use App\Models\Instituicao;
use App\Models\Unidade;
use App\Models\User;
use App\Policies\ChamadoPolicy;
use Tests\TestCase;

class ChamadoPolicyTest extends TestCase
{
    private ChamadoPolicy $policy;

    private User $gestor;

    private Espaco $espaco;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = app(ChamadoPolicy::class);

        $instituicao = Instituicao::factory()->create();
        $unidade = Unidade::factory()->create(['instituicao_id' => $instituicao->id]);
        $unidade->refresh();

        $this->gestor = User::factory()->create(['setor_id' => $unidade->setors()->first()->id]);
        $this->espaco = Espaco::factory()->create();
        $this->gestor->refresh();
    }

    private function chamado(): Chamado
    {
        return Chamado::factory()->paraEspaco($this->espaco)->create();
    }

    public function test_gestor_com_permissao_ve_a_fila(): void
    {
        $this->assertTrue($this->policy->viewAny($this->gestor->fresh()));
    }

    public function test_usuario_sem_permissao_nao_ve_a_fila(): void
    {
        $comum = User::factory()->create(['setor_id' => $this->gestor->setor_id]);

        $this->assertFalse($this->policy->viewAny($comum));
    }

    public function test_gestor_do_espaco_pode_triar(): void
    {
        $this->assertTrue($this->policy->update($this->gestor->fresh(), $this->chamado()));
    }

    public function test_gestor_de_outro_espaco_nao_pode_triar(): void
    {
        // Tem a permissao, mas nao administra nenhuma agenda deste espaco.
        $outroGestor = User::factory()->create(['setor_id' => $this->gestor->setor_id]);
        $outroGestor->assignRole('gestor');

        $this->assertTrue($outroGestor->hasPermissionTo('chamados.triar'));
        $this->assertFalse($this->policy->update($outroGestor, $this->chamado()));
    }

    public function test_gestor_do_espaco_sem_permissao_nao_pode_triar(): void
    {
        $this->gestor->removeRole('gestor');
        $this->gestor->refresh();

        $this->assertFalse($this->policy->update($this->gestor, $this->chamado()));
    }

    public function test_chamado_nao_pode_ser_criado_pela_area_logada(): void
    {
        // Chamados nascem da rota publica anonima, nunca de um usuario logado.
        $this->assertFalse($this->policy->create($this->gestor->fresh()));
    }

    public function test_chamado_nao_pode_ser_apagado(): void
    {
        $chamado = $this->chamado();
        $gestor = $this->gestor->fresh();

        $this->assertFalse($this->policy->delete($gestor, $chamado));
        $this->assertFalse($this->policy->forceDelete($gestor, $chamado));
        $this->assertFalse($this->policy->restore($gestor, $chamado));
    }

    public function test_apenas_quem_gere_espacos_ve_a_fila_de_orfaos(): void
    {
        $institucional = User::factory()->create(['setor_id' => $this->gestor->setor_id]);
        $institucional->givePermissionTo('secao.gestao-espacos');

        $this->assertTrue($this->policy->viewOrfaos($institucional->fresh()));
        $this->assertFalse($this->policy->viewOrfaos($this->gestor->fresh()));
    }

    public function test_gestor_perde_o_acesso_ao_deixar_de_gerir_o_espaco(): void
    {
        $chamado = $this->chamado();
        $gestor = $this->gestor->fresh();

        $this->assertTrue($this->policy->update($gestor, $chamado));

        // Removido de todas as agendas do espaco.
        $this->espaco->agendas()->update(['user_id' => null]);

        $this->assertFalse($this->policy->update($gestor, $chamado->fresh()));
    }
}
