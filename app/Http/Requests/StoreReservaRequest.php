<?php

namespace App\Http\Requests;

use App\Rules\HorarioDisponivel;
use Illuminate\Foundation\Http\FormRequest;

class StoreReservaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Permite que qualquer usuário autenticado tente criar
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'data_inicial' => 'required',
            'data_final' => 'required',
            'recorrencia' => 'required|in:unica,15dias,1mes,personalizado',
            // Validação do array de horários
            'horarios_solicitados' => 'required|array|min:1',

            // Validação de CADA item dentro do array
            'horarios_solicitados.*.data' => 'required',
            'horarios_solicitados.*.horario_inicio' => 'required|date_format:H:i:s',
            'horarios_solicitados.*.horario_fim' => 'required|date_format:H:i:s',
            'horarios_solicitados.*.agenda_id' => [
                'required',
                'integer',
                'exists:agendas,id', // Garante que a agenda existe no banco
                new HorarioDisponivel($this->input('horarios_solicitados.*.data'), $this->input('horarios_solicitados.*.horario_inicio')),
            ],
        ];
    }
}
