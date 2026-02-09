<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Andar extends Model
{
    /** @use HasFactory<\Database\Factories\AndarFactory> */
    use HasFactory;

    protected $fillable = [
        'nome',
        'tipo_acesso',
        'modulo_id',
    ];

    /**
     * Atributos que vão ser feito o cast
     *
     * @var array
     */
    protected $casts = [
        'tipo_acesso' => 'array',
    ];

    public function modulo()
    {
        return $this->belongsTo(Modulo::class);
    }

    public function espacos()
    {
        return $this->hasMany(Espaco::class);
    }
}
