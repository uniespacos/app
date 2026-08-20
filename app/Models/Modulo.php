<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Modulo extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'unidade_id',
    ];

    /**
     * @return BelongsTo<Unidade, $this>
     */
    public function unidade(): BelongsTo
    {
        return $this->belongsTo(Unidade::class);
    }

    /**
     * @return HasMany<Espaco, $this>
     */
    public function espacos(): HasMany
    {
        return $this->hasMany(Espaco::class);
    }

    /**
     * @return HasMany<Andar, $this>
     */
    public function andars(): HasMany
    {
        return $this->hasMany(Andar::class);
    }
}
