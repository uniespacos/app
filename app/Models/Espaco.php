<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\EspacoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class Espaco extends Model
{
    /** @use HasFactory<EspacoFactory> */
    use HasFactory;

    protected $fillable = [
        'public_id',
        'nome',
        'capacidade_pessoas',
        'descricao',
        'imagens',
        'main_image_index',
        'andar_id',
        'user_id',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'imagens' => 'array',
    ];

    /**
     * @var list<string>
     */
    protected $appends = ['is_favorited_by_user'];

    /**
     * Garante que todo espaco nasca com um identificador publico,
     * usado na URL do QR Code fixado na porta.
     */
    protected static function booted(): void
    {
        static::creating(function (Espaco $espaco) {
            if (empty($espaco->public_id)) {
                $espaco->public_id = (string) Str::ulid();
            }
        });
    }

    /**
     * @return HasMany<Agenda, $this>
     */
    public function agendas(): HasMany
    {
        return $this->hasMany(Agenda::class);
    }

    /**
     * @return MorphMany<Chamado, $this>
     */
    public function chamados(): MorphMany
    {
        return $this->morphMany(Chamado::class, 'reportable');
    }

    /**
     * Caminho legivel do espaco na hierarquia fisica, para exibir a quem
     * escaneou o QR Code e precisa confirmar que esta na sala certa.
     * Depende de andar.modulo.unidade estar carregado.
     */
    public function getLocalizacaoCompletaAttribute(): string
    {
        $partes = array_filter([
            $this->andar?->modulo?->unidade?->sigla,
            $this->andar?->modulo?->nome,
            $this->andar?->nome,
        ]);

        return implode(' › ', $partes);
    }

    /**
     * @return BelongsTo<Andar, $this>
     */
    public function andar(): BelongsTo
    {
        return $this->belongsTo(Andar::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function favoritadoPor(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'espaco_user', 'espaco_id', 'user_id');
    }

    /**
     * Returns whether the currently authenticated user has favorited this space.
     */
    public function getIsFavoritedByUserAttribute(): bool
    {
        $user = Auth::user();

        if (! $user) {
            return false;
        }

        return $user->favoritos()->where('espaco_id', $this->id)->exists();
    }
}
