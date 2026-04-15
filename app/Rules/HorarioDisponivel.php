<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Translation\PotentiallyTranslatedString;

class HorarioDisponivel implements DataAwareRule, ValidationRule
{
    /**
     * @var array<string, mixed>
     */
    protected array $data = [];

    /**
     * Sets the full request data, called by Laravel before validation runs.
     */
    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    /**
     * Run the validation rule.
     * Checks whether the requested time slot is already taken (situacao = deferida).
     *
     * @param  Closure(string): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $index = explode('.', $attribute)[1];
        $horario = $this->data['horarios_solicitados'][$index];

        $conflict = DB::table('horarios')
            ->where('data', $horario['data'])
            ->where('horario_inicio', $horario['horario_inicio'])
            ->where('agenda_id', $horario['agenda_id'])
            ->where('situacao', 'deferida')
            ->exists();

        if ($conflict) {
            $fail('O horário selecionado já está reservado ou em análise.');
        }
    }
}
