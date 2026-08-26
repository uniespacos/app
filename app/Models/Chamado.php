<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ChamadoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Str;

class Chamado extends Model
{
    /** @use HasFactory<ChamadoFactory> */
    use HasFactory;

    protected $fillable = [
        'protocolo',
        'reportable_type',
        'reportable_id',
        'tipo_id',
        'categoria_id',
        'descricao',
        'status',
        'contato_nome',
        'contato_email',
        'fotos',
        'resolvido_por',
        'resolvido_em',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'fotos' => 'array',
        'resolvido_em' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Chamado $chamado) {
            if (empty($chamado->protocolo)) {
                $chamado->protocolo = (string) Str::ulid();
            }
        });
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function reportable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function resolvidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolvido_por');
    }

    /**
     * @return BelongsTo<TipoChamado, $this>
     */
    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoChamado::class, 'tipo_id')->withTrashed();
    }

    /**
     * @return BelongsTo<CategoriaChamado, $this>
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaChamado::class, 'categoria_id')->withTrashed();
    }
}
