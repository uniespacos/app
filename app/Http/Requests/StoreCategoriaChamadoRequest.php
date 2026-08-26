<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoriaChamadoRequest extends FormRequest
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
                Rule::unique('categorias_chamado', 'slug')->whereNull('deleted_at'),
            ],
            'descricao' => ['nullable', 'string', 'max:255'],
            'ordem' => ['required', 'integer', 'min:0', 'max:9999'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'Informe o nome da categoria.',
            'slug.required' => 'Informe o identificador da categoria.',
            'slug.regex' => 'O identificador aceita apenas letras minúsculas, números e hífen.',
            'slug.unique' => 'Já existe uma categoria ativa com esse identificador.',
            'ordem.required' => 'Informe a posição da categoria na lista.',
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
        ];
    }
}
