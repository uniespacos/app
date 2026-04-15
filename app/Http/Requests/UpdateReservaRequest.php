<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Rules\HorarioDisponivel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReservaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'data_inicial' => ['required'],
            'data_final' => ['required'],
            'recorrencia' => ['required', 'in:unica,15dias,1mes,personalizado'],
            'edit_scope' => ['required', 'string', Rule::in(['single', 'recurring'])],
            'edited_week_date' => ['required_if:edit_scope,single', 'nullable', 'date'],
            'horarios_solicitados' => ['present', 'array'],
            'horarios_solicitados.*.data' => ['required'],
            'horarios_solicitados.*.horario_inicio' => ['required', 'date_format:H:i:s'],
            'horarios_solicitados.*.horario_fim' => ['required', 'date_format:H:i:s'],
            'horarios_solicitados.*.agenda_id' => [
                'required',
                'integer',
                'exists:agendas,id',
                new HorarioDisponivel,
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'edit_scope.required' => 'O escopo de edição é obrigatório.',
            'edit_scope.in' => 'O escopo de edição deve ser "single" ou "recurring".',
            'edited_week_date.required_if' => 'A data da semana editada é obrigatória para edição de ocorrência única.',
        ];
    }
}
