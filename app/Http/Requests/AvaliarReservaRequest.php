<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AvaliarReservaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->permission_type_id == 2; // Permite que qualquer usuário autenticado tente criar
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'situacao' => 'required|in:parcialmente_deferida,deferida,indeferida,em_analise', // Garante que o valor seja um dos esperados
            'motivo' => 'required_if:situacao,indeferida|nullable',
            'observacao' => 'nullable|string|max:500', // Observação opcional, mas se fornecida, deve ser uma string com no máximo 500 caracteres
            'horarios_avaliados' => 'required|array', // Garante que seja um array
            'horarios_avaliados.*.status' => 'required', // Verifica se cada ID de horário é válido
            'horarios_avaliados.*.id' => 'required',
            // 'horarios_avaliados.*.dadosReserva.horarioDB' => 'required',
            // 'horarios_avaliados.*.dadosReserva.horarioDB.id' => 'required',
            'evaluation_scope' => ['required', 'string', Rule::in(['recurring', 'single'])],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $horariosAvaliados = $this->input('horarios_avaliados');

        if (is_array($horariosAvaliados)) {
            $modifiedHorarios = array_map(function ($item) {
                if (isset($item['dadosReserva']['horarioDB']['id'])) {
                    $item['dadosReserva'] = [
                        'horarioDB' => [
                            'id' => $item['dadosReserva']['horarioDB']['id'],
                        ],
                    ];
                }

                return $item;
            }, $horariosAvaliados);

            $this->merge([
                'horarios_avaliados' => $modifiedHorarios,
            ]);
        }
    }
}
