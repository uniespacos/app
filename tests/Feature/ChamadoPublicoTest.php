<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\Chamado\StatusChamadoEnum;
use App\Enums\Chamado\TipoChamadoEnum;
use App\Models\Chamado;
use App\Models\Espaco;
use App\Models\Instituicao;
use App\Models\Unidade;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Honeypot\Honeypot;
use Tests\TestCase;

class ChamadoPublicoTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // EspacoFactory depende da cadeia Instituicao > Unidade > Modulo > Andar
        // e, no afterCreating, de ao menos um User da mesma instituicao para
        // assumir as agendas dos tres turnos.
        $instituicao = Instituicao::factory()->create();
        $unidade = Unidade::factory()->create(['instituicao_id' => $instituicao->id]);
        $unidade->refresh();

        User::factory()->create(['setor_id' => $unidade->setors()->first()->id]);
    }

    private function espaco(): Espaco
    {
        return Espaco::factory()->create();
    }

    public function test_espaco_recebe_public_id_automaticamente(): void
    {
        $espaco = $this->espaco();

        $this->assertNotNull($espaco->public_id);
        $this->assertSame(26, strlen($espaco->public_id));
    }

    public function test_formulario_de_report_e_acessivel_sem_login(): void
    {
        $espaco = $this->espaco();

        $this->get(route('chamados.reportar', ['espaco' => $espaco->public_id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Chamados/ReportarPage')
                ->where('espaco.nome', $espaco->nome)
                ->where('auth.user', null)
                ->has('categorias', 6)
            );
    }

    public function test_public_id_inexistente_retorna_404(): void
    {
        $this->get(route('chamados.reportar', ['espaco' => 'NAOEXISTE0000000000000000']))
            ->assertNotFound();
    }

    public function test_espaco_nao_e_acessivel_pelo_id_sequencial(): void
    {
        $espaco = $this->espaco();

        // O binding e escopado por public_id: passar o id numerico nao resolve.
        $this->get('/reportar/'.$espaco->id)->assertNotFound();
    }

    public function test_reporta_chamado_anonimo_com_sucesso(): void
    {
        $espaco = $this->espaco();

        $response = $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'categoria' => 'eletrica',
            'descricao' => 'A lampada do fundo da sala esta queimada ha uma semana.',
        ]);

        $chamado = Chamado::first();

        $this->assertNotNull($chamado);
        $response->assertRedirect(route('chamados.reportar.sucesso', ['chamado' => $chamado->protocolo]));

        $this->assertDatabaseHas('chamados', [
            'reportable_type' => Espaco::class,
            'reportable_id' => $espaco->id,
            'categoria' => 'eletrica',
            'tipo' => TipoChamadoEnum::DEFEITO->value,
            'status' => StatusChamadoEnum::ABERTO->value,
        ]);

        $this->assertNotNull($chamado->protocolo);
        $this->assertNull($chamado->contato_email);
    }

    public function test_contato_e_opcional_mas_persistido_quando_informado(): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'categoria' => 'ti',
            'descricao' => 'O projetor da sala nao liga de jeito nenhum.',
            'contato_nome' => 'Maria da Silva',
            'contato_email' => 'maria@uesb.edu.br',
        ]);

        $this->assertDatabaseHas('chamados', [
            'contato_nome' => 'Maria da Silva',
            'contato_email' => 'maria@uesb.edu.br',
        ]);
    }

    public function test_rejeita_categoria_fora_do_enum(): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'categoria' => 'inexistente',
            'descricao' => 'Descricao suficientemente longa para passar na validacao.',
        ])->assertSessionHasErrors('categoria');

        $this->assertDatabaseCount('chamados', 0);
    }

    public function test_rejeita_descricao_curta_e_email_invalido(): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'categoria' => 'limpeza',
            'descricao' => 'curto',
            'contato_email' => 'nao-e-email',
        ])->assertSessionHasErrors(['descricao', 'contato_email']);

        $this->assertDatabaseCount('chamados', 0);
    }

    public function test_armazena_fotos_no_disco_public(): void
    {
        Storage::fake('public');
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'categoria' => 'mobiliario',
            'descricao' => 'A porta da sala esta com a fechadura quebrada.',
            'fotos' => [UploadedFile::fake()->image('problema.jpg')],
        ]);

        $chamado = Chamado::first();

        $this->assertCount(1, $chamado->fotos);
        Storage::disk('public')->assertExists($chamado->fotos[0]);
    }

    public function test_tela_de_sucesso_mostra_protocolo_e_espaco(): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'categoria' => 'hidraulica',
            'descricao' => 'A torneira do banheiro nao fecha e esta desperdicando agua.',
        ]);

        $chamado = Chamado::first();

        $this->get(route('chamados.reportar.sucesso', ['chamado' => $chamado->protocolo]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Chamados/ReportarSucessoPage')
                ->where('chamado.protocolo', $chamado->protocolo)
                ->where('chamado.categoria', 'Hidráulica')
                ->where('chamado.status', 'Aberto')
                ->where('chamado.espaco', $espaco->nome)
            );
    }

    public function test_formulario_expoe_os_campos_do_honeypot(): void
    {
        $espaco = $this->espaco();

        $this->get(route('chamados.reportar', ['espaco' => $espaco->public_id]))
            ->assertInertia(fn ($page) => $page
                ->where('honeypot.enabled', true)
                ->has('honeypot.nameFieldName')
                ->has('honeypot.validFromFieldName')
                ->has('honeypot.encryptedValidFrom')
            );
    }

    public function test_bot_que_preenche_o_campo_invisivel_e_barrado(): void
    {
        $espaco = $this->espaco();
        $honeypot = app(Honeypot::class);

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'categoria' => 'eletrica',
            'descricao' => 'Spam gerado automaticamente por um bot qualquer.',
            // Humano nunca vê este campo; bot preenche tudo que encontra.
            $honeypot->nameFieldName() => 'http://spam.example.com',
            $honeypot->validFromFieldName() => $honeypot->encryptedValidFrom(),
        ]);

        $this->assertDatabaseCount('chamados', 0);
    }

    public function test_envio_rapido_demais_para_ser_humano_e_barrado(): void
    {
        $espaco = $this->espaco();
        $honeypot = app(Honeypot::class);

        // Timestamp no futuro: o formulario "ainda nao pode" ser enviado.
        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'categoria' => 'eletrica',
            'descricao' => 'Envio instantaneo, mais rapido do que qualquer pessoa digitaria.',
            $honeypot->nameFieldName() => '',
            $honeypot->validFromFieldName() => encrypt(now()->addMinute()->timestamp),
        ]);

        $this->assertDatabaseCount('chamados', 0);
    }

    public function test_humano_que_deixa_o_campo_vazio_passa_normalmente(): void
    {
        $espaco = $this->espaco();
        $honeypot = app(Honeypot::class);

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'categoria' => 'eletrica',
            'descricao' => 'Report legitimo de uma pessoa que preencheu o formulario.',
            $honeypot->nameFieldName() => '',
            $honeypot->validFromFieldName() => encrypt(now()->subMinute()->timestamp),
        ]);

        $this->assertDatabaseCount('chamados', 1);
    }

    public function test_contador_de_chamados_abertos_aparece_no_formulario(): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'categoria' => 'eletrica',
            'descricao' => 'O ar-condicionado da sala parou de gelar.',
        ]);

        $this->get(route('chamados.reportar', ['espaco' => $espaco->public_id]))
            ->assertInertia(fn ($page) => $page->where('espaco.chamados_abertos', 1));
    }
}
