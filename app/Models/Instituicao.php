<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\InstituicaoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Instituicao extends Model
{
    /** @use HasFactory<InstituicaoFactory> */
    use HasFactory;

    protected $fillable = [
        'nome',
        'sigla',
        'endereco',
    ];

    /**
     * @return HasMany<Unidade, $this>
     */
    public function unidades(): HasMany
    {
        return $this->hasMany(Unidade::class);
    }

    /**
     * @return HasManyThrough<Setor, Unidade, $this>
     */
    public function setors(): HasManyThrough
    {
        return $this->hasManyThrough(
            Setor::class,
            Unidade::class,
            'instituicao_id',
            'unidade_id',
            'id',
            'id'
        );
    }
}
