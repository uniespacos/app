<?php

namespace App\Rules;

use App\Models\Andar;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UniqueNormalizedFloorName implements ValidationRule
{
    protected $ignoreId;

    /**
     * Cria uma nova instância da regra.
     *
     * @param  int|null  $ignoreId  ID do registro a ser ignorado (para atualizações)
     * @return void
     */
    public function __construct($ignoreId = null)
    {
        $this->ignoreId = $ignoreId;
    }

    /**
     * Executa a regra de validação.
     *
     * @param  string  $attribute  O nome do atributo que está sendo validado.
     * @param  mixed  $value  O valor do atributo.
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail  A closure para chamar se a validação falhar.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {

        if (! is_string($value)) {
            return; // Retornar se não for string, deixando outras regras cuidarem disso.
        }

        $nomeNormalizado = Andar::normalizarNome($value); // Use o método estático do seu modelo

        $query = Andar::where('nome_normalizado', $nomeNormalizado);

        if ($this->ignoreId !== null) {
            $query->where('id', '!=', $this->ignoreId);
        }

        if ($query->exists()) {
            // Se o nome normalizado já existe, chame a closure $fail com a mensagem de erro.
            $fail('Este nome de andar, ou uma variação dele, já está cadastrado.');
        }
    }
}
