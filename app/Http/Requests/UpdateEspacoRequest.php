<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateEspacoRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a fazer esta requisição.
     *
     * @return bool
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
        return [
            'nome' => [
                'required',
                'string',
                'max:255',
            ],
            'capacidade_pessoas' => ['required', 'integer', 'min:1'],
            'descricao' => ['nullable', 'string'],
            'andar_id' => ['required', 'exists:andars,id'],

            // Novas imagens a serem adicionadas. É 'nullable' pois o usuário pode não adicionar novas.
            'imagens' => ['nullable', 'array'],
            'imagens.*' => ['image', 'mimes:jpeg,png,jpg,gif', 'max:5120'], // Valida cada arquivo

            // O índice da nova imagem principal. Pode ser nulo se a imagem principal não mudar.
            'main_image_index' => ['nullable', 'integer'],

            // Lista de URLs/paths das imagens existentes que devem ser deletadas.
            'images_to_delete' => ['nullable', 'array'],
            'images_to_delete.*' => ['string'], // Cada item é uma string (o path da imagem)
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
            'capacidade_pessoas.integer' => 'A capacidade de pessoas deve ser um número inteiro.',
            'capacidade_pessoas.min' => 'A capacidade de pessoas deve ser de no mínimo :min.',

            // Mensagens para o array de imagens
            'imagens.array' => 'O campo de imagens deve ser um conjunto de arquivos.',
            'imagens.max' => 'Você pode enviar no máximo :max imagens.',
            'imagens.*.image' => 'O arquivo enviado não é uma imagem válida.',
            'imagens.*.mimes' => 'A imagem deve ser de um dos seguintes tipos: :values.',
            'imagens.*.max' => 'Cada imagem não pode ter mais de 5MB.',

            'main_image_index.required_with' => 'É necessário selecionar uma imagem principal quando imagens são enviadas.',
        ];
    }
}
