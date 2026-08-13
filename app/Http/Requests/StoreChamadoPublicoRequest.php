<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\Chamado\CategoriaChamadoEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChamadoPublicoRequest extends FormRequest
{
    /**
     * Rota publica: qualquer pessoa com o QR Code pode reportar,
     * sem login. A protecao fica no rate limiting e no honeypot.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'categoria' => ['required', 'string', Rule::in(CategoriaChamadoEnum::values())],
            'descricao' => ['required', 'string', 'min:10', 'max:2000'],
            'contato_nome' => ['nullable', 'string', 'max:255'],
            'contato_email' => ['nullable', 'email', 'max:255'],
            'fotos' => ['nullable', 'array', 'max:3'],
            'fotos.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'categoria.required' => 'Selecione o tipo de problema.',
            'categoria.in' => 'O tipo de problema selecionado é inválido.',
            'descricao.required' => 'Descreva o problema encontrado.',
            'descricao.min' => 'Descreva o problema com um pouco mais de detalhe (mínimo :min caracteres).',
            'descricao.max' => 'A descrição pode ter no máximo :max caracteres.',
            'contato_email.email' => 'Informe um e-mail válido para receber retorno.',
            'fotos.max' => 'Você pode enviar no máximo :max fotos.',
            'fotos.*.image' => 'O arquivo enviado não é uma imagem válida.',
            'fotos.*.mimes' => 'A foto deve ser de um dos seguintes tipos: :values.',
            'fotos.*.max' => 'Cada foto não pode ter mais de 5MB.',
        ];
    }
}
