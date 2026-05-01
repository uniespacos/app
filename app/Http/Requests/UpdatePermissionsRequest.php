<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdatePermissionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()?->hasPermissionTo('usuarios.gerenciar-permissoes');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'role_name' => ['required', 'string', 'in:institucional,gestor,comum'],
            'agendas' => ['nullable', 'array'],
            'agendas.*' => ['integer', 'exists:agendas,id'],
        ];
    }
}
