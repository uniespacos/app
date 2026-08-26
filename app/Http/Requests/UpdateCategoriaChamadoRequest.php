<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateCategoriaChamadoRequest extends StoreCategoriaChamadoRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('taxonomias-chamado.atualizar');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = parent::rules();

        $rules['slug'] = [
            'required',
            'string',
            'min:2',
            'max:255',
            'regex:/^[a-z0-9-]+$/',
            Rule::unique('categorias_chamado', 'slug')
                ->whereNull('deleted_at')
                ->ignore($this->route('categoria')?->id),
        ];

        return $rules;
    }
}
