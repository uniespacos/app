<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Rules\HorarioDisponivel;
use App\Rules\HorariosMesmoEspaco;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreReservaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
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
            'horarios_solicitados' => ['required', 'array', 'min:1', new HorariosMesmoEspaco],
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
}
