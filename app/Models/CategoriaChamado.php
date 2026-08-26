<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\CategoriaChamadoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CategoriaChamado extends Model
{
    /** @use HasFactory<CategoriaChamadoFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $table = 'categorias_chamado';

    protected $fillable = [
        'nome',
        'slug',
        'descricao',
        'ordem',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'ordem' => 'integer',
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
