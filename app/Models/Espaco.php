<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Espaco extends Model
{
    /** @use HasFactory<\Database\Factories\EspacoFactory> */
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
     * Casting para array os urls das imagens
     *
     * @var array
     */
    protected $casts = [
        'imagens' => 'array',
    ];

    protected $appends = ['is_favorited_by_user']; // Adicione este atributo

    public function agendas()
    {
        return $this->hasMany(Agenda::class);
    }

    public function andar()
    {
        return $this->belongsTo(Andar::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function favoritadoPor()
    {
        return $this->belongsToMany(User::class, 'espaco_user', 'espaco_id', 'user_id');
    }

    public function getIsFavoritedByUserAttribute(): bool
    {
        $user = Auth::user();

        if (! $user) {
            return false;
        }

        // Essa linha é a crucial e deve estar como abaixo
        return $user->favoritos()->where('espaco_id', $this->id)->exists();
    }
}
