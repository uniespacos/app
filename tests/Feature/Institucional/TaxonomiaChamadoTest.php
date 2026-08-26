<?php

declare(strict_types=1);

namespace Tests\Feature\Institucional;

use App\Models\CategoriaChamado;
use App\Models\Instituicao;
use App\Models\TipoChamado;
use App\Models\Unidade;
use App\Models\User;
use Tests\TestCase;

class TaxonomiaChamadoTest extends TestCase
{
    private User $institucional;

    protected function setUp(): void
    {
        parent::setUp();

        $instituicao = Instituicao::factory()->create();
        $unidade = Unidade::factory()->create(['instituicao_id' => $instituicao->id]);
        $unidade->refresh();

        $this->institucional = User::factory()->create(['setor_id' => $unidade->setors()->first()->id]);
        $this->institucional->assignRole('institucional');
        $this->institucional->refresh();
    }

    public function test_tela_lista_tipos_e_categorias(): void
    {
        $this->actingAs($this->institucional)
            ->get(route('institucional.taxonomias-chamado.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Administrativo/TaxonomiasChamado/TaxonomiasChamado')
                ->has('tipos', 3)
                ->has('categorias', 6)
            );
    }

    public function test_usuario_sem_permissao_nao_acessa(): void
    {
        $comum = User::factory()->create(['setor_id' => $this->institucional->setor_id]);
        $comum->assignRole('comum');

        $this->actingAs($comum)
            ->get(route('institucional.taxonomias-chamado.index'))
            ->assertForbidden();
    }

    public function test_cadastra_tipo(): void
    {
        $this->actingAs($this->institucional)
            ->post(route('institucional.taxonomias-chamado.tipos.store'), [
                'nome' => 'Elogio',
                'slug' => 'elogio',
                'descricao' => 'Reconhecimento de algo que funcionou bem',
                'ordem' => 4,
                'exibe_alerta_espaco' => false,
            ])
            ->assertRedirect(route('institucional.taxonomias-chamado.index'));

        $this->assertDatabaseHas('tipos_chamado', [
            'slug' => 'elogio',
            'nome' => 'Elogio',
            'exibe_alerta_espaco' => false,
        ]);
    }

    public function test_cadastra_categoria(): void
    {
        $this->actingAs($this->institucional)
            ->post(route('institucional.taxonomias-chamado.categorias.store'), [
                'nome' => 'Acessibilidade',
                'slug' => 'acessibilidade',
                'descricao' => 'Rampa, corrimão, sinalização',
                'ordem' => 7,
            ])
            ->assertRedirect(route('institucional.taxonomias-chamado.index'));

        $this->assertDatabaseHas('categorias_chamado', ['slug' => 'acessibilidade']);
    }

    public function test_rejeita_slug_duplicado(): void
    {
        $this->actingAs($this->institucional)
            ->post(route('institucional.taxonomias-chamado.categorias.store'), [
                'nome' => 'Elétrica nova',
                'slug' => 'eletrica',
                'ordem' => 9,
            ])
            ->assertSessionHasErrors('slug');
    }

    public function test_atualiza_categoria_mantendo_o_proprio_slug(): void
    {
        $categoria = CategoriaChamado::query()->where('slug', 'limpeza')->first();

        $this->actingAs($this->institucional)
            ->put(route('institucional.taxonomias-chamado.categorias.update', ['categoria' => $categoria->id]), [
                'nome' => 'Limpeza e conservação',
                'slug' => 'limpeza',
                'descricao' => 'Sala suja, lixo acumulado',
                'ordem' => 5,
            ])
            ->assertRedirect(route('institucional.taxonomias-chamado.index'));

        $this->assertDatabaseHas('categorias_chamado', [
            'id' => $categoria->id,
            'nome' => 'Limpeza e conservação',
        ]);
    }

    public function test_exclusao_e_soft_delete(): void
    {
        $tipo = TipoChamado::query()->where('slug', 'sugestao')->first();

        $this->actingAs($this->institucional)
            ->delete(route('institucional.taxonomias-chamado.tipos.destroy', ['tipo' => $tipo->id]))
            ->assertRedirect(route('institucional.taxonomias-chamado.index'));

        $this->assertNull(TipoChamado::query()->find($tipo->id));
        $this->assertNotNull(TipoChamado::withTrashed()->find($tipo->id));
    }

    public function test_slug_excluido_pode_ser_recadastrado(): void
    {
        $categoria = CategoriaChamado::query()->where('slug', 'ti')->first();

        $this->actingAs($this->institucional)
            ->delete(route('institucional.taxonomias-chamado.categorias.destroy', ['categoria' => $categoria->id]))
            ->assertRedirect();

        $this->actingAs($this->institucional)
            ->post(route('institucional.taxonomias-chamado.categorias.store'), [
                'nome' => 'Informática',
                'slug' => 'ti',
                'descricao' => 'Computador, projetor, rede',
                'ordem' => 4,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('institucional.taxonomias-chamado.index'));

        $this->assertSame(2, CategoriaChamado::withTrashed()->where('slug', 'ti')->count());
    }
}
