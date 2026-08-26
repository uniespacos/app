<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateTipoChamadoRequest extends StoreTipoChamadoRequest
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
            Rule::unique('tipos_chamado', 'slug')
                ->whereNull('deleted_at')
                ->ignore($this->route('tipo')?->id),
        ];

        return $rules;
    }
}
