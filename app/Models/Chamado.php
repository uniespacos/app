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
        'tipo',
        'categoria',
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

    /**
     * Garante que todo chamado nasca com um protocolo publico,
     * independente de quem o criou.
     */
    protected static function booted(): void
    {
        static::creating(function (Chamado $chamado) {
            if (empty($chamado->protocolo)) {
                $chamado->protocolo = (string) Str::ulid();
            }
        });
    }

    /**
     * Alvo do chamado. Nesta entrega sempre um Espaco;
     * Equipamento entra quando o modulo de inventario existir.
     *
     * @return MorphTo<Model, $this>
     */
    public function reportable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Gestor que registrou a resolucao do chamado.
     *
     * @return BelongsTo<User, $this>
     */
    public function resolvidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolvido_por');
    }
}
