<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\TipoChamadoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoChamado extends Model
{
    /** @use HasFactory<TipoChamadoFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $table = 'tipos_chamado';

    protected $fillable = [
        'nome',
        'slug',
        'descricao',
        'ordem',
        'exibe_alerta_espaco',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'ordem' => 'integer',
        'exibe_alerta_espaco' => 'boolean',
    ];

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOrdenado(Builder $query): Builder
    {
        return $query->orderBy('ordem')->orderBy('nome');
    }
}
