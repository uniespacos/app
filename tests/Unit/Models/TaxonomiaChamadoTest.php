<?php

declare(strict_types=1);

namespace Tests\Unit\Models;

use App\Models\CategoriaChamado;
use App\Models\Chamado;
use App\Models\Espaco;
use App\Models\Instituicao;
use App\Models\TipoChamado;
use App\Models\Unidade;
use App\Models\User;
use Tests\TestCase;

class TaxonomiaChamadoTest extends TestCase
{
    public function test_soft_delete_tira_o_registro_das_consultas_padrao(): void
    {
        $tipo = TipoChamado::factory()->create();

        $tipo->delete();

        $this->assertNull(TipoChamado::query()->find($tipo->id));
        $this->assertNotNull(TipoChamado::withTrashed()->find($tipo->id));
        $this->assertDatabaseHas('tipos_chamado', ['id' => $tipo->id]);
    }

    public function test_flag_de_alerta_e_booleano(): void
    {
        $comAlerta = TipoChamado::factory()->comAlerta()->create();
        $semAlerta = TipoChamado::factory()->create();

        $this->assertTrue($comAlerta->exibe_alerta_espaco);
        $this->assertFalse($semAlerta->exibe_alerta_espaco);
    }

    public function test_scope_ordenado_usa_ordem_e_depois_nome(): void
    {
        CategoriaChamado::query()->delete();

        CategoriaChamado::factory()->create(['nome' => 'Zebra', 'slug' => 'zebra', 'ordem' => 1]);
        CategoriaChamado::factory()->create(['nome' => 'Alfa', 'slug' => 'alfa', 'ordem' => 2]);
        CategoriaChamado::factory()->create(['nome' => 'Beta', 'slug' => 'beta', 'ordem' => 2]);

        $nomes = CategoriaChamado::query()->ordenado()->pluck('nome')->all();

        $this->assertSame(['Zebra', 'Alfa', 'Beta'], $nomes);
    }

    public function test_slug_pode_ser_recadastrado_apos_exclusao(): void
    {
        $categoria = CategoriaChamado::factory()->create(['slug' => 'infiltracao']);
        $categoria->delete();

        $nova = CategoriaChamado::factory()->create(['slug' => 'infiltracao']);

        $this->assertNotSame($categoria->id, $nova->id);
    }

    public function test_chamado_resolve_o_rotulo_de_taxonomia_excluida(): void
    {
        $instituicao = Instituicao::factory()->create();
        $unidade = Unidade::factory()->create(['instituicao_id' => $instituicao->id]);
        $unidade->refresh();
        User::factory()->create(['setor_id' => $unidade->setors()->first()->id]);

        $espaco = Espaco::factory()->create();
        $tipo = TipoChamado::factory()->create(['nome' => 'Defeito grave']);
        $categoria = CategoriaChamado::factory()->create(['nome' => 'Infiltração']);

        $chamado = Chamado::factory()->paraEspaco($espaco)->create([
            'tipo_id' => $tipo->id,
            'categoria_id' => $categoria->id,
        ]);

        $tipo->delete();
        $categoria->delete();

        $recarregado = Chamado::with(['tipo', 'categoria'])->find($chamado->id);

        $this->assertSame('Defeito grave', $recarregado->tipo->nome);
        $this->assertSame('Infiltração', $recarregado->categoria->nome);
    }
}
