<?php

declare(strict_types=1);

namespace App\Rules;

use App\Models\Andar;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class UniqueNormalizedFloorName implements ValidationRule
{
    protected ?int $ignoreId;

    /**
     * @param  int|null  $ignoreId  ID of the record to ignore (for updates)
     */
    public function __construct(?int $ignoreId = null)
    {
        $this->ignoreId = $ignoreId;
    }

    /**
     * Run the validation rule.
     * Ensures no other floor has the same normalized name (case-insensitive).
     *
     * @param  Closure(string): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        $normalized = Andar::normalizarNome($value);
        $query = Andar::where('nome_normalizado', $normalized);

        if ($this->ignoreId !== null) {
            $query->where('id', '!=', $this->ignoreId);
        }

        if ($query->exists()) {
            $fail('Este nome de andar, ou uma variação dele, já está cadastrado.');
        }
    }
}
