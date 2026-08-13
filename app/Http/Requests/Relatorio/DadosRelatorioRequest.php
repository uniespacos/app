<?php

declare(strict_types=1);

namespace App\Http\Requests\Relatorio;

use App\Enums\Agenda\AgendaEnum;
use App\Enums\Relatorio\TipoRelatorioEnum;
use App\Enums\SituacaoReserva\SituacaoReservaEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

final class DadosRelatorioRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tipo = TipoRelatorioEnum::tryFrom($this->string('tipo')->toString());

        if ($tipo === null) {
            return false;
        }

        return (bool) $this->user()?->hasPermissionTo($tipo->permissao());
    }

    public function rules(): array
    {
        return [
            'tipo' => ['required', new Enum(TipoRelatorioEnum::class)],
            'data_inicio' => ['nullable', 'date'],
            'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
            'situacoes' => ['nullable', 'array'],
            'situacoes.*' => ['in:'.implode(',', array_column(SituacaoReservaEnum::cases(), 'value'))],
            'turnos' => ['nullable', 'array'],
            'turnos.*' => ['in:'.implode(',', array_column(AgendaEnum::cases(), 'value'))],
            'unidade_id' => ['nullable', 'integer', 'exists:unidades,id'],
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'andar_id' => ['nullable', 'integer', 'exists:andars,id'],
            'espaco_id' => ['nullable', 'integer', 'exists:espacos,id'],
            'setor_id' => ['nullable', 'integer', 'exists:setors,id'],
        ];
    }
}
