<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTipoChamadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('taxonomias-chamado.criar');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'min:2', 'max:255'],
            'slug' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('tipos_chamado', 'slug')->whereNull('deleted_at'),
            ],
            'descricao' => ['nullable', 'string', 'max:255'],
            'ordem' => ['required', 'integer', 'min:0', 'max:9999'],
            'exibe_alerta_espaco' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'Informe o nome do tipo.',
            'slug.required' => 'Informe o identificador do tipo.',
            'slug.regex' => 'O identificador aceita apenas letras minúsculas, números e hífen.',
            'slug.unique' => 'Já existe um tipo ativo com esse identificador.',
            'ordem.required' => 'Informe a posição do tipo na lista.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'nome' => 'nome',
            'slug' => 'identificador',
            'descricao' => 'descrição',
            'ordem' => 'ordem',
            'exibe_alerta_espaco' => 'alerta na tela de reserva',
        ];
    }
}
