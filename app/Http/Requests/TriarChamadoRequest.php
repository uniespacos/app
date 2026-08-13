<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\Chamado\StatusChamadoEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TriarChamadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) Auth::user()?->hasPermissionTo('chamados.triar');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(StatusChamadoEnum::values())],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Informe a nova situação do chamado.',
            'status.in' => 'A situação selecionada é inválida.',
        ];
    }
}
