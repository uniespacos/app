<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unidade extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'sigla',
        'instituicao_id',
    ];

    /**
     * @return BelongsTo<Instituicao, $this>
     */
    public function instituicao(): BelongsTo
    {
        return $this->belongsTo(Instituicao::class);
    }

    /**
     * @return HasMany<Setor, $this>
     */
    public function setors(): HasMany
    {
        return $this->hasMany(Setor::class);
    }

    /**
     * @return HasMany<Modulo, $this>
     */
    public function modulos(): HasMany
    {
        return $this->hasMany(Modulo::class);
    }
}
