<?php

declare(strict_types=1);

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
        return Auth::user()?->permission_type_id === 2;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'situacao' => ['required', Rule::in(['parcialmente_deferida', 'deferida', 'indeferida', 'em_analise'])],
            'motivo' => ['required_if:situacao,indeferida', 'nullable'],
            'observacao' => ['nullable', 'string', 'max:500'],
            'horarios_avaliados' => ['required', 'array'],
            'horarios_avaliados.*.status' => ['required'],
            'horarios_avaliados.*.id' => ['required'],
            'evaluation_scope' => ['required', 'string', Rule::in(['recurring', 'single'])],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $horariosAvaliados = $this->input('horarios_avaliados');

        if (! is_array($horariosAvaliados)) {
            return;
        }

        $this->merge([
            'horarios_avaliados' => array_map(function ($item) {
                if (isset($item['dadosReserva']['horarioDB']['id'])) {
                    $item['dadosReserva'] = [
                        'horarioDB' => ['id' => $item['dadosReserva']['horarioDB']['id']],
                    ];
                }

                return $item;
            }, $horariosAvaliados),
        ]);
    }
}
