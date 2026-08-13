<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\Chamado\CategoriaChamadoEnum;
use App\Enums\Chamado\StatusChamadoEnum;
use App\Enums\Chamado\TipoChamadoEnum;
use App\Models\Chamado;
use App\Models\Espaco;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Chamado>
 */
class ChamadoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Nesta entrega o morph so aponta para Espaco; Equipamento entra
            // quando o modulo de inventario existir.
            'reportable_type' => Espaco::class,
            'reportable_id' => Espaco::factory(),
            'tipo' => TipoChamadoEnum::DEFEITO->value,
            'categoria' => $this->faker->randomElement(CategoriaChamadoEnum::values()),
            'descricao' => $this->faker->text(150),
            'status' => StatusChamadoEnum::ABERTO->value,
            'contato_nome' => null,
            'contato_email' => null,
            'fotos' => null,
            'resolvido_por' => null,
            'resolvido_em' => null,
        ];
    }

    /**
     * Chamado aberto para um espaco especifico.
     */
    public function paraEspaco(Espaco $espaco): static
    {
        return $this->state(fn (array $attributes): array => [
            'reportable_type' => Espaco::class,
            'reportable_id' => $espaco->id,
        ]);
    }

    /**
     * Chamado de uma categoria especifica.
     */
    public function categoria(CategoriaChamadoEnum|string $categoria): static
    {
        return $this->state(fn (array $attributes): array => [
            'categoria' => $categoria instanceof CategoriaChamadoEnum ? $categoria->value : $categoria,
        ]);
    }

    /**
     * Reportante que deixou contato para receber retorno.
     */
    public function comContato(?string $email = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'contato_nome' => $this->faker->name(),
            'contato_email' => $email ?? $this->faker->safeEmail(),
        ]);
    }

    /**
     * Chamado que o gestor assumiu, mas ainda nao encerrou.
     */
    public function emAndamento(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => StatusChamadoEnum::EM_ANDAMENTO->value,
        ]);
    }

    /**
     * Chamado ja encerrado, com o gestor que registrou a resolucao.
     */
    public function resolvido(?User $gestor = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => StatusChamadoEnum::RESOLVIDO->value,
            'resolvido_por' => $gestor?->id ?? User::factory(),
            'resolvido_em' => now(),
        ]);
    }

    /**
     * Chamado cancelado pelo gestor.
     */
    public function cancelado(?User $gestor = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => StatusChamadoEnum::CANCELADO->value,
            'resolvido_por' => $gestor?->id ?? User::factory(),
            'resolvido_em' => now(),
        ]);
    }

    /**
     * Chamado com fotos anexadas pelo reportante.
     */
    public function comFotos(int $quantidade = 1): static
    {
        return $this->state(fn (array $attributes): array => [
            'fotos' => array_map(
                fn (int $i): string => 'chamados_fotos/exemplo-'.$i.'.jpg',
                range(1, $quantidade)
            ),
        ]);
    }
}
