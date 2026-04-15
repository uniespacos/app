<?php

declare(strict_types=1);

namespace App\Rules;

use App\Models\Espaco;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class UsuarioDaMesmaInstituicaoDaAgenda implements ValidationRule
{
    protected ?Espaco $espaco;

    public function __construct(int $espacoId)
    {
        $this->espaco = Espaco::find($espacoId);
    }

    /**
     * Run the validation rule.
     * Ensures the assigned user belongs to the same institution as the space.
     *
     * @param  Closure(string): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value) {
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
