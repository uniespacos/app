<?php

namespace App\Http\Requests;

use App\Rules\UsuarioDaMesmaInstituicaoDaAgenda;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class AlterarGestoresEspacoRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a fazer esta requisição.
     */
    public function authorize(): bool
    {
        return Auth::user()->permission_type_id === 1;
    }

    /**
     * Retorna as regras de validação que se aplicam à requisição.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Pega o ID do espaço da rota (ex: /espacos/{espaco})
        $espacoId = $this->route('espaco')->id;

        return [
            'gestores' => 'required',
            'gestores.turno.*' => 'required|string|in:manha,tarde,noite',
            'gestores.user_id.*' => ['nullable', 'exists:users,id', new UsuarioDaMesmaInstituicaoDaAgenda($espacoId)],

        ];
    }

    /**
     * Retorna mensagens de erro personalizadas para as regras de validação.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Mensagens para campos obrigatórios
            'required' => 'O campo :attribute é obrigatório.',

            // Mensagem genérica para existência em tabelas
            'exists' => 'O valor selecionado para :attribute é inválido.',

            // Mensagens específicas por campo
        ];
    }
}
