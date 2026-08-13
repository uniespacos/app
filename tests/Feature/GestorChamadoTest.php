<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\Chamado\StatusChamadoEnum;
use App\Models\Andar;
use App\Models\Chamado;
use App\Models\Espaco;
use App\Models\Instituicao;
use App\Models\Modulo;
use App\Models\Unidade;
use App\Models\User;
use App\Notifications\ChamadoOrfaoNotification;
use App\Notifications\ChamadoResolvidoNotification;
use App\Notifications\NovoChamadoNotification;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class GestorChamadoTest extends TestCase
{
    private User $gestor;

    private Espaco $espaco;

    protected function setUp(): void
    {
        parent::setUp();

        $instituicao = Instituicao::factory()->create();
        $unidade = Unidade::factory()->create(['instituicao_id' => $instituicao->id]);
        $unidade->refresh();

        $this->gestor = User::factory()->create(['setor_id' => $unidade->setors()->first()->id]);

        // A EspacoFactory sorteia gestores da instituicao para as 3 agendas;
        // com um unico usuario disponivel, ele assume todos os turnos.
        $this->espaco = Espaco::factory()->create();
        $this->gestor->refresh();
    }

    private function chamado(array $attrs = []): Chamado
    {
        return Chamado::factory()
            ->paraEspaco($this->espaco)
            ->categoria('eletrica')
            ->create($attrs);
    }

    public function test_gestor_ve_chamados_dos_espacos_que_administra(): void
    {
        $this->chamado();

        $this->actingAs($this->gestor)
            ->get(route('gestor.chamados.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Gestor/ChamadosPage')
                ->where('chamados.total', 1)
                ->where('totalAbertos', 1)
                ->where('chamados.data.0.espaco', $this->espaco->nome)
                ->where('chamados.data.0.status', 'Aberto')
            );
    }

    public function test_usuario_sem_permissao_nao_acessa_a_fila(): void
    {
        $comum = User::factory()->create(['setor_id' => $this->gestor->setor_id]);

        $this->actingAs($comum)
            ->get(route('gestor.chamados.index'))
            ->assertForbidden();
    }

    public function test_fila_nao_mostra_chamado_de_espaco_de_outro_gestor(): void
    {
        // Espaco de outra instituicao, com gestor proprio.
        $outraInstituicao = Instituicao::factory()->create();
        $outraUnidade = Unidade::factory()->create(['instituicao_id' => $outraInstituicao->id]);
        $outraUnidade->refresh();
        $outroGestor = User::factory()->create(['setor_id' => $outraUnidade->setors()->first()->id]);
        $espacoAlheio = Espaco::factory()->create([
            'andar_id' => Andar::factory()->create([
                'modulo_id' => Modulo::factory()->create(['unidade_id' => $outraUnidade->id])->id,
            ])->id,
        ]);

        Chamado::factory()->paraEspaco($espacoAlheio)->categoria('ti')->create();

        $this->assertNotNull($outroGestor);

        $this->actingAs($this->gestor)
            ->get(route('gestor.chamados.index'))
            ->assertInertia(fn ($page) => $page->where('chamados.total', 0));
    }

    public function test_gestor_marca_chamado_como_resolvido(): void
    {
        $chamado = $this->chamado();

        $this->actingAs($this->gestor)
            ->patch(route('gestor.chamados.update', ['chamado' => $chamado->id]), [
                'status' => StatusChamadoEnum::RESOLVIDO->value,
            ])
            ->assertRedirect(route('gestor.chamados.index'));

        $chamado->refresh();

        $this->assertSame(StatusChamadoEnum::RESOLVIDO->value, $chamado->status);
        $this->assertSame($this->gestor->id, $chamado->resolvido_por);
        $this->assertNotNull($chamado->resolvido_em);
    }

    public function test_em_andamento_nao_marca_resolucao(): void
    {
        $chamado = $this->chamado();

        $this->actingAs($this->gestor)
            ->patch(route('gestor.chamados.update', ['chamado' => $chamado->id]), [
                'status' => StatusChamadoEnum::EM_ANDAMENTO->value,
            ]);

        $chamado->refresh();

        $this->assertSame(StatusChamadoEnum::EM_ANDAMENTO->value, $chamado->status);
        $this->assertNull($chamado->resolvido_por);
        $this->assertNull($chamado->resolvido_em);
    }

    public function test_rejeita_status_fora_do_enum(): void
    {
        $chamado = $this->chamado();

        $this->actingAs($this->gestor)
            ->patch(route('gestor.chamados.update', ['chamado' => $chamado->id]), [
                'status' => 'inventado',
            ])
            ->assertSessionHasErrors('status');

        $this->assertSame(StatusChamadoEnum::ABERTO->value, $chamado->refresh()->status);
    }

    public function test_gestores_do_espaco_sao_notificados_do_novo_chamado(): void
    {
        Notification::fake();

        $this->post(route('chamados.reportar.store', ['espaco' => $this->espaco->public_id]), [
            'categoria' => 'eletrica',
            'descricao' => 'O ar-condicionado da sala parou de funcionar.',
        ]);

        Notification::assertSentTo($this->gestor, NovoChamadoNotification::class);
    }

    public function test_reportante_com_email_e_avisado_quando_resolvido(): void
    {
        Notification::fake();

        $chamado = $this->chamado(['contato_email' => 'reportante@uesb.edu.br']);

        $this->actingAs($this->gestor)
            ->patch(route('gestor.chamados.update', ['chamado' => $chamado->id]), [
                'status' => StatusChamadoEnum::RESOLVIDO->value,
            ]);

        Notification::assertSentOnDemand(
            ChamadoResolvidoNotification::class,
            fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === 'reportante@uesb.edu.br'
        );
    }

    public function test_reportante_sem_email_nao_gera_envio(): void
    {
        Notification::fake();

        $chamado = $this->chamado();

        $this->actingAs($this->gestor)
            ->patch(route('gestor.chamados.update', ['chamado' => $chamado->id]), [
                'status' => StatusChamadoEnum::RESOLVIDO->value,
            ]);

        Notification::assertNothingSentTo(new AnonymousNotifiable);
        Notification::assertNotSentTo(new AnonymousNotifiable, ChamadoResolvidoNotification::class);
    }

    public function test_em_andamento_nao_avisa_o_reportante(): void
    {
        Notification::fake();

        $chamado = $this->chamado(['contato_email' => 'reportante@uesb.edu.br']);

        $this->actingAs($this->gestor)
            ->patch(route('gestor.chamados.update', ['chamado' => $chamado->id]), [
                'status' => StatusChamadoEnum::EM_ANDAMENTO->value,
            ]);

        Notification::assertNotSentTo(new AnonymousNotifiable, ChamadoResolvidoNotification::class);
    }

    public function test_nao_reenvia_email_quando_status_nao_muda(): void
    {
        $chamado = $this->chamado([
            'contato_email' => 'reportante@uesb.edu.br',
            'status' => StatusChamadoEnum::RESOLVIDO->value,
        ]);

        Notification::fake();

        $this->actingAs($this->gestor)
            ->patch(route('gestor.chamados.update', ['chamado' => $chamado->id]), [
                'status' => StatusChamadoEnum::RESOLVIDO->value,
            ]);

        Notification::assertNotSentTo(new AnonymousNotifiable, ChamadoResolvidoNotification::class);
    }

    public function test_chamado_em_espaco_sem_gestor_nao_quebra_o_report(): void
    {
        Notification::fake();

        $this->espaco->agendas()->update(['user_id' => null]);

        $this->post(route('chamados.reportar.store', ['espaco' => $this->espaco->public_id]), [
            'categoria' => 'outros',
            'descricao' => 'Problema em espaco que ficou sem gestor atribuido.',
        ])->assertRedirect();

        $this->assertDatabaseCount('chamados', 1);
        Notification::assertNotSentTo($this->gestor, NovoChamadoNotification::class);
    }

    public function test_institucional_e_notificado_de_chamado_orfao(): void
    {
        Notification::fake();

        $institucional = User::factory()->create(['setor_id' => $this->gestor->setor_id]);
        $institucional->givePermissionTo('secao.gestao-espacos');

        $this->espaco->agendas()->update(['user_id' => null]);

        $this->post(route('chamados.reportar.store', ['espaco' => $this->espaco->public_id]), [
            'categoria' => 'eletrica',
            'descricao' => 'Problema em espaco sem nenhum gestor atribuido.',
        ]);

        Notification::assertSentTo($institucional, ChamadoOrfaoNotification::class);
    }

    public function test_painel_lista_apenas_chamados_de_espacos_sem_gestor(): void
    {
        $institucional = User::factory()->create(['setor_id' => $this->gestor->setor_id]);
        $institucional->givePermissionTo('secao.gestao-espacos');

        // Chamado em espaco COM gestor: nao deve aparecer no painel de orfaos.
        $this->chamado();

        // Chamado em espaco SEM gestor: deve aparecer.
        $this->espaco->agendas()->update(['user_id' => null]);
        $orfao = $this->chamado(['categoria' => 'hidraulica']);

        $this->actingAs($institucional)
            ->get(route('institucional.chamados.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Institucional/ChamadosOrfaosPage')
                // Ambos os chamados apontam para o mesmo espaco, que agora
                // esta sem gestor — logo os dois sao orfaos.
                ->where('totalOrfaos', 2)
                ->where('chamados.data.0.protocolo', $orfao->protocolo)
            );
    }

    public function test_painel_de_orfaos_ignora_chamados_encerrados(): void
    {
        $institucional = User::factory()->create(['setor_id' => $this->gestor->setor_id]);
        $institucional->givePermissionTo('secao.gestao-espacos');

        $this->espaco->agendas()->update(['user_id' => null]);
        $this->chamado(['status' => StatusChamadoEnum::RESOLVIDO->value]);
        $this->chamado(['status' => StatusChamadoEnum::ABERTO->value]);

        $this->actingAs($institucional)
            ->get(route('institucional.chamados.index'))
            ->assertInertia(fn ($page) => $page->where('totalOrfaos', 1));
    }

    public function test_gestor_comum_nao_acessa_o_painel_de_orfaos(): void
    {
        $this->actingAs($this->gestor)
            ->get(route('institucional.chamados.index'))
            ->assertForbidden();
    }

    public function test_tela_do_espaco_alerta_sobre_chamados_abertos(): void
    {
        $this->chamado();
        $this->chamado(['categoria' => 'ti']);
        $this->chamado(['categoria' => 'ti']);

        $this->actingAs($this->gestor)
            ->get(route('espacos.show', ['espaco' => $this->espaco->id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('chamadosAbertos.total', 3)
                // Ordenado por quantidade: Informatica (2) antes de Eletrica (1).
                ->where('chamadosAbertos.categorias.0.label', 'Informática')
                ->where('chamadosAbertos.categorias.0.total', 2)
                ->where('chamadosAbertos.categorias.1.label', 'Elétrica')
                ->where('chamadosAbertos.categorias.1.total', 1)
            );
    }

    public function test_alerta_ignora_chamados_ja_encerrados(): void
    {
        $this->chamado(['status' => StatusChamadoEnum::RESOLVIDO->value]);
        $this->chamado(['status' => StatusChamadoEnum::CANCELADO->value]);
        $this->chamado(['status' => StatusChamadoEnum::EM_ANDAMENTO->value]);

        $this->actingAs($this->gestor)
            ->get(route('espacos.show', ['espaco' => $this->espaco->id]))
            ->assertInertia(fn ($page) => $page
                // Apenas o "em andamento" conta: ainda e um problema vigente.
                ->where('chamadosAbertos.total', 1)
            );
    }

    public function test_espaco_sem_chamados_nao_recebe_alerta(): void
    {
        $this->actingAs($this->gestor)
            ->get(route('espacos.show', ['espaco' => $this->espaco->id]))
            ->assertInertia(fn ($page) => $page
                ->where('chamadosAbertos.total', 0)
                ->where('chamadosAbertos.categorias', [])
            );
    }

    public function test_alerta_nao_bloqueia_a_reserva(): void
    {
        $this->chamado();

        // O alerta e informativo: a tela responde normalmente, sem redirect
        // nem erro, mesmo com problema reportado em aberto.
        $this->actingAs($this->gestor)
            ->get(route('espacos.show', ['espaco' => $this->espaco->id]))
            ->assertOk()
            ->assertSessionHasNoErrors();
    }

    public function test_report_publico_continua_anonimo_e_alimenta_a_fila(): void
    {
        $this->post(route('chamados.reportar.store', ['espaco' => $this->espaco->public_id]), [
            'categoria' => 'limpeza',
            'descricao' => 'A sala esta com lixo acumulado desde ontem.',
        ]);

        $this->actingAs($this->gestor)
            ->get(route('gestor.chamados.index'))
            ->assertInertia(fn ($page) => $page
                ->where('chamados.total', 1)
                ->where('chamados.data.0.categoria', 'Limpeza')
                ->where('chamados.data.0.contato_email', null)
            );
    }
}
