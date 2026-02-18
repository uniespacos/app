<?php

namespace App\Rules;

use App\Models\Espaco;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UsuarioDaMesmaInstituicaoDaAgenda implements ValidationRule
{
    protected $espaco;

    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct($espacoId)
    {
        $this->espaco = Espaco::find($espacoId);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value) { // Permite user_id nulo
            return;
        }

        $user = User::find($value);

        if (! $user || ! $this->espaco) {
            $fail('O espaço ou usuário informado é inválido.');

            return;
        }

        if ($user->setor->unidade->instituicao_id !== $this->espaco->andar->modulo->unidade->instituicao_id) {
            $fail('O gestor deve pertencer à mesma instituição do espaço.');
        }
    }
}
