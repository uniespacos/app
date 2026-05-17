<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdatePermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = Auth::user();

        if (! $user?->hasPermissionTo('usuarios.gerenciar-permissoes')) {
            return false;
        }

        if ($this->has('direct_permissions')) {
            return $user->hasPermissionTo('usuarios.gerenciar-permissoes-diretas');
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'role_name' => ['required', 'string', 'exists:roles,name'],
            'agendas' => ['nullable', 'array'],
            'agendas.*' => ['integer', 'exists:agendas,id'],
            'direct_permissions' => ['nullable', 'array'],
            'direct_permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
