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
}
