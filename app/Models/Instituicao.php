<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Instituicao extends Model
{
    /** @use HasFactory<\Database\Factories\InstituicaoFactory> */
    use HasFactory;

    protected $fillable = [
        'nome',
        'sigla',
        'endereco',
    ];

    public function unidades()
    {
        return $this->hasMany(Unidade::class);
    }

    public function setors()
    {
        return $this->hasManyThrough(
            Setor::class,
            Unidade::class,
            'instituicao_id',   // Foreign key on unidades table
            'unidade_id',      // Foreign key on setors table...
            'id',               // Local key on instituicaos table...
            'id'          // Local key on unidades table...
        );
    }
}
