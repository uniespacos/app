<?php

namespace App\Http\Requests;

use Illuminate\Support\Facades\Auth;

class UpdateSetorRequest extends StoreSetorRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = parent::rules();

        return $rules;
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Verificar se o usuário pode editar este módulo específico
        return Auth::user()->permission_type_id === 1;
    }
}
