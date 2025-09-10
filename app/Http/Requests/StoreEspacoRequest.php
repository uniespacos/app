<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEspacoRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a fazer esta requisição.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return auth()->user()->permission_type_id === 1; // Apenas administradores podem criar espaços
    }

    /**
     * Retorna as regras de validação que se aplicam à requisição.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Validações de Chave Estrangeira
            'unidade_id' => ['required', 'integer', 'exists:unidades,id'],
            'modulo_id'  => ['required', 'integer', 'exists:modulos,id'],
            'andar_id'   => ['required', 'integer', 'exists:andars,id'],

            // Validações de Dados do Espaço
            'nome'               => ['required', 'string', 'max:255'],
            'capacidade_pessoas' => ['required', 'integer', 'min:1'],
            'descricao'          => ['required', 'nullable', 'string'],

            // Validações de Imagens
            'imagens'            => ['nullable', 'array', 'max:5'], // Limita o número de imagens a 5
            'imagens.*'          => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // Valida cada imagem (5MB)

            // Excelente observação a sua! 'required_with' é melhor que 'nullable' aqui.
            // O campo será obrigatório apenas se o campo 'imagens' for enviado.
            'main_image_index'   => ['required_with:imagens', 'nullable', 'integer'],
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
