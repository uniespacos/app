<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\Chamado\StatusChamadoEnum;
use App\Models\CategoriaChamado;
use App\Models\Chamado;
use App\Models\Espaco;
use App\Models\Instituicao;
use App\Models\TipoChamado;
use App\Models\Unidade;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Honeypot\Honeypot;
use Tests\TestCase;

class ChamadoPublicoTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $instituicao = Instituicao::factory()->create();
        $unidade = Unidade::factory()->create(['instituicao_id' => $instituicao->id]);
        $unidade->refresh();

        User::factory()->create(['setor_id' => $unidade->setors()->first()->id]);
    }

    private function espaco(): Espaco
    {
        return Espaco::factory()->create();
    }

    /**
     * Ids do catalogo semeado pelo TaxonomiaChamadoSeeder.
     */
    private function tipoId(string $slug = 'defeito'): int
    {
        return TipoChamado::query()->where('slug', $slug)->value('id');
    }

    private function categoriaId(string $slug): int
    {
        return CategoriaChamado::query()->where('slug', $slug)->value('id');
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
                ->has('tipos', 3)
                ->where('catalogoVazio', false)
            );
    }

    public function test_formulario_avisa_quando_o_catalogo_esta_vazio(): void
    {
        $espaco = $this->espaco();

        CategoriaChamado::query()->delete();

        $this->get(route('chamados.reportar', ['espaco' => $espaco->public_id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Chamados/ReportarPage')
                ->where('catalogoVazio', true)
                ->has('categorias', 0)
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

        $this->get('/reportar/'.$espaco->id)->assertNotFound();
    }

    public function test_reporta_chamado_anonimo_com_sucesso(): void
    {
        $espaco = $this->espaco();

        $response = $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $this->categoriaId('eletrica'),
            'descricao' => 'A lampada do fundo da sala esta queimada ha uma semana.',
        ]);

        $chamado = Chamado::first();

        $this->assertNotNull($chamado);
        $response->assertRedirect(route('chamados.reportar.sucesso', ['chamado' => $chamado->protocolo]));

        $this->assertDatabaseHas('chamados', [
            'reportable_type' => Espaco::class,
            'reportable_id' => $espaco->id,
            'categoria_id' => $this->categoriaId('eletrica'),
            'tipo_id' => $this->tipoId(),
            'status' => StatusChamadoEnum::ABERTO->value,
        ]);

        $this->assertNotNull($chamado->protocolo);
        $this->assertNull($chamado->contato_email);
    }

    /**
     * @return list<array{0: string}>
     */
    public static function tiposDisponiveis(): array
    {
        return [['defeito'], ['reclamacao'], ['sugestao']];
    }

    #[DataProvider('tiposDisponiveis')]
    public function test_reportante_escolhe_o_tipo_do_registro(string $slug): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'tipo_id' => $this->tipoId($slug),
            'categoria_id' => $this->categoriaId('outros'),
            'descricao' => 'Registro de teste com descricao suficientemente longa.',
        ]);

        $this->assertDatabaseHas('chamados', [
            'tipo_id' => $this->tipoId($slug),
        ]);
    }

    public function test_contato_e_opcional_mas_persistido_quando_informado(): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $this->categoriaId('ti'),
            'descricao' => 'O projetor da sala nao liga de jeito nenhum.',
            'contato_nome' => 'Maria da Silva',
            'contato_email' => 'maria@uesb.edu.br',
        ]);

        $this->assertDatabaseHas('chamados', [
            'contato_nome' => 'Maria da Silva',
            'contato_email' => 'maria@uesb.edu.br',
        ]);
    }

    public function test_rejeita_categoria_inexistente(): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'tipo_id' => $this->tipoId(),
            'categoria_id' => 999999,
            'descricao' => 'Descricao suficientemente longa para passar na validacao.',
        ])->assertSessionHasErrors('categoria_id');

        $this->assertDatabaseCount('chamados', 0);
    }

    public function test_rejeita_categoria_excluida(): void
    {
        $espaco = $this->espaco();
        $categoriaId = $this->categoriaId('limpeza');

        CategoriaChamado::query()->whereKey($categoriaId)->delete();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $categoriaId,
            'descricao' => 'Descricao suficientemente longa para passar na validacao.',
        ])->assertSessionHasErrors('categoria_id');

        $this->assertDatabaseCount('chamados', 0);
    }

    public function test_rejeita_descricao_curta_e_email_invalido(): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $this->categoriaId('limpeza'),
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
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $this->categoriaId('mobiliario'),
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
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $this->categoriaId('hidraulica'),
            'descricao' => 'A torneira do banheiro nao fecha e esta desperdicando agua.',
        ]);

        $chamado = Chamado::first();

        $this->get(route('chamados.reportar.sucesso', ['chamado' => $chamado->protocolo]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Chamados/ReportarSucessoPage')
                ->where('chamado.protocolo', $chamado->protocolo)
                ->where('chamado.tipo', 'Defeito')
                ->where('chamado.categoria', 'Hidráulica')
                ->where('chamado.status', 'Aberto')
                ->where('chamado.espaco', $espaco->nome)
            );
    }

    public function test_chamado_historico_mantem_o_rotulo_apos_a_taxonomia_ser_excluida(): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $this->categoriaId('hidraulica'),
            'descricao' => 'A torneira do banheiro nao fecha e esta desperdicando agua.',
        ]);

        $chamado = Chamado::first();

        TipoChamado::query()->whereKey($this->tipoId())->delete();
        CategoriaChamado::query()->whereKey($this->categoriaId('hidraulica'))->delete();

        $this->get(route('chamados.reportar.sucesso', ['chamado' => $chamado->protocolo]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('chamado.tipo', 'Defeito')
                ->where('chamado.categoria', 'Hidráulica')
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
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $this->categoriaId('eletrica'),
            'descricao' => 'Spam gerado automaticamente por um bot qualquer.',
            $honeypot->nameFieldName() => 'http://spam.example.com',
            $honeypot->validFromFieldName() => $honeypot->encryptedValidFrom(),
        ]);

        $this->assertDatabaseCount('chamados', 0);
    }

    public function test_envio_rapido_demais_para_ser_humano_e_barrado(): void
    {
        $espaco = $this->espaco();
        $honeypot = app(Honeypot::class);

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $this->categoriaId('eletrica'),
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
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $this->categoriaId('eletrica'),
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
            'tipo_id' => $this->tipoId(),
            'categoria_id' => $this->categoriaId('eletrica'),
            'descricao' => 'O ar-condicionado da sala parou de gelar.',
        ]);

        $this->get(route('chamados.reportar', ['espaco' => $espaco->public_id]))
            ->assertInertia(fn ($page) => $page->where('espaco.chamados_abertos', 1));
    }

    public function test_contador_ignora_tipos_fora_do_alerta(): void
    {
        $espaco = $this->espaco();

        $this->post(route('chamados.reportar.store', ['espaco' => $espaco->public_id]), [
            'tipo_id' => $this->tipoId('sugestao'),
            'categoria_id' => $this->categoriaId('outros'),
            'descricao' => 'Seria bom ter mais tomadas perto das carteiras do fundo.',
        ]);

        $this->get(route('chamados.reportar', ['espaco' => $espaco->public_id]))
            ->assertInertia(fn ($page) => $page->where('espaco.chamados_abertos', 0));
    }
}
