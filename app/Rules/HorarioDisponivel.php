<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Support\Facades\DB;

// Implementamos a ValidationRule (padrão Laravel 11) e a DataAwareRule (para acesso aos dados)
class HorarioDisponivel implements ValidationRule, DataAwareRule
{
    /**
     * Todos os dados da requisição.
     * @var array
     */
    protected $data = [];

    /**
     * Define os dados da requisição para a regra.
     * @param  array  $data
     * @return $this
     */
    public function setData($data)
    {
        $this->data = $data;
        return $this;
    }

    /**
     * Executa a regra de validação.
     * Este é o método padrão do Laravel 11.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // A lógica interna é exatamente a mesma da abordagem __invoke.
        $index = explode('.', $attribute)[1];
        $horarioAtual = $this->data['horarios_solicitados'][$index];

        $data = $horarioAtual['data'];
        $horario_inicio = $horarioAtual['horario_inicio'];
        $agenda_id = $horarioAtual['agenda_id'];

        // Consulta para verificar o conflito.
        $conflito = DB::table('horarios')
            ->where('horarios.data', $data)
            ->where('horarios.horario_inicio', $horario_inicio)
            ->where('horarios.agenda_id', $agenda_id)
            ->whereIn('horarios.situacao', ['deferida'])
            ->exists();

        // Se houver um conflito, chamamos a função $fail com a mensagem de erro.
        if ($conflito) {
            $fail('O horário selecionado já está reservado ou em análise.');
        }
    }
}
