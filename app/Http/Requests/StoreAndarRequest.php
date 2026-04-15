<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreAndarRequest extends FormRequest
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
            'nome' => ['required', 'string'],
            'tipo_acesso' => ['required'],
            'modulo_id' => ['required', 'integer', 'exists:modulos,id'],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'Erro: Nome já cadastrado ou campo em branco!',
            'tipo_acesso.required' => 'Campo "Tipo de acesso" não pode vir em branco.',
            'modulo_id.required' => 'O módulo é obrigatório.',
            'modulo_id.exists' => 'O módulo selecionado não existe.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'nome' => 'nome do andar',
            'tipo_acesso' => 'tipo de acesso',
            'modulo_id' => 'módulo',
        ];
    }
}
