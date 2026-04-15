<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\EspacoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class Espaco extends Model
{
    /** @use HasFactory<EspacoFactory> */
    use HasFactory;

    protected $fillable = [
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
     * @return HasMany<Agenda, $this>
     */
    public function agendas(): HasMany
    {
        return $this->hasMany(Agenda::class);
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
