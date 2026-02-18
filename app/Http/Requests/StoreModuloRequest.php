<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreModuloRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->permission_type_id === 1;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Dados básicos do módulo
            'nome' => [
                'required',
                'string',
                'max:255',
                'min:2',
            ],
            'unidade_id' => [
                'required',
                'integer',
                'exists:unidades,id',
            ],

            // Validação dos andares
            'andares' => [
                'required',
                'array',
                'min:1',
                'max:12', // Máximo: 2 subsolos + térreo + 10 andares superiores
            ],
            'andares.*.nome' => [
                'required',
                'string',
                'in:subsolo-2,subsolo-1,terreo,andar-1,andar-2,andar-3,andar-4,andar-5,andar-6,andar-7,andar-8,andar-9,andar-10',
            ],
            'andares.*.tipo_acesso' => [
                'required',
                'array',
                'min:1',
            ],
            'andares.*.tipo_acesso.*' => [
                'required',
                'string',
                'in:terreo,escada,elevador,rampa',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            // Mensagens para dados básicos
            'nome.required' => 'O nome do módulo é obrigatório.',
            'nome.string' => 'O nome do módulo deve ser um texto válido.',
            'nome.max' => 'O nome do módulo não pode ter mais de 255 caracteres.',
            'nome.min' => 'O nome do módulo deve ter pelo menos 2 caracteres.',

            'unidade_id.required' => 'A unidade é obrigatória.',
            'unidade_id.integer' => 'A unidade deve ser um número válido.',
            'unidade_id.exists' => 'A unidade selecionada não existe.',

            // Mensagens para andares
            'andares.required' => 'Pelo menos um andar deve ser configurado.',
            'andares.array' => 'Os andares devem ser uma lista válida.',
            'andares.min' => 'Pelo menos um andar deve ser configurado.',
            'andares.max' => 'Máximo de 12 andares permitidos (2 subsolos + térreo + 10 andares superiores).',

            'andares.*.nome.required' => 'O nome do andar é obrigatório.',
            'andares.*.nome.string' => 'O nome do andar deve ser um texto válido.',
            'andares.*.nome.in' => 'O andar selecionado não é válido.',

            'andares.*.tipo_acesso.required' => 'Pelo menos um tipo de acesso deve ser selecionado.',
            'andares.*.tipo_acesso.array' => 'Os tipos de acesso devem ser uma lista válida.',
            'andares.*.tipo_acesso.min' => 'Pelo menos um tipo de acesso deve ser selecionado.',
            'andares.*.tipo_acesso.*.required' => 'O tipo de acesso é obrigatório.',
            'andares.*.tipo_acesso.*.string' => 'O tipo de acesso deve ser um texto válido.',
            'andares.*.tipo_acesso.*.in' => 'O tipo de acesso selecionado não é válido.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'nome' => 'nome do módulo',
            'unidade_id' => 'unidade',
            'andares' => 'andares',
            'andares.*.nome' => 'nome do andar',
            'andares.*.tipo_acesso' => 'tipos de acesso',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validateAndaresStructure($validator);
            $this->validateAndaresUniqueness($validator);
            $this->validateTerreoExists($validator);
            $this->validateSequenceIntegrity($validator);
        });
    }

    /**
     * Valida se a estrutura dos andares está correta.
     */
    protected function validateAndaresStructure($validator): void
    {
        $andares = $this->input('andares', []);

        if (empty($andares)) {
            return;
        }

        // Mapear nomes para níveis numéricos
        $nivelMap = [
            'subsolo-2' => -2,
            'subsolo-1' => -1,
            'terreo' => 0,
            'andar-1' => 1,
            'andar-2' => 2,
            'andar-3' => 3,
            'andar-4' => 4,
            'andar-5' => 5,
            'andar-6' => 6,
            'andar-7' => 7,
            'andar-8' => 8,
            'andar-9' => 9,
            'andar-10' => 10,
        ];

        $niveis = [];
        foreach ($andares as $andar) {
            if (isset($andar['nome']) && isset($nivelMap[$andar['nome']])) {
                $niveis[] = $nivelMap[$andar['nome']];
            }
        }

        if (empty($niveis)) {
            return;
        }

        sort($niveis);

        // Verificar se há gaps na sequência
        for ($i = 1; $i < count($niveis); $i++) {
            $atual = $niveis[$i];
            $anterior = $niveis[$i - 1];

            if ($atual - $anterior > 1) {
                $nomeAnterior = array_search($anterior, $nivelMap);
                $nomeAtual = array_search($atual, $nivelMap);

                $validator->errors()->add(
                    'andares',
                    "Há um gap na sequência entre {$this->formatAndarName($nomeAnterior)} e {$this->formatAndarName($nomeAtual)}. Todos os andares intermediários devem estar presentes."
                );
                break;
            }
        }
    }

    /**
     * Valida se não há andares duplicados.
     */
    protected function validateAndaresUniqueness($validator): void
    {
        $andares = $this->input('andares', []);
        $nomes = array_column($andares, 'nome');
        $nomesUnicos = array_unique($nomes);

        if (count($nomes) !== count($nomesUnicos)) {
            $validator->errors()->add('andares', 'Há andares duplicados. Cada andar deve ser único.');
        }
    }

    /**
     * Valida se o térreo existe (obrigatório).
     */
    protected function validateTerreoExists($validator): void
    {
        $andares = $this->input('andares', []);
        $nomes = array_column($andares, 'nome');

        if (! in_array('terreo', $nomes)) {
            $validator->errors()->add('andares', 'O térreo é obrigatório e deve estar presente.');
        }
    }

    /**
     * Valida a integridade da sequência (regras de dependência).
     */
    protected function validateSequenceIntegrity($validator): void
    {
        $andares = $this->input('andares', []);
        $nomes = array_column($andares, 'nome');

        // Verificar se andares superiores têm seus pré-requisitos
        $andaresSuperiores = ['andar-1', 'andar-2', 'andar-3', 'andar-4', 'andar-5', 'andar-6', 'andar-7', 'andar-8', 'andar-9', 'andar-10'];

        foreach ($andaresSuperiores as $andar) {
            if (in_array($andar, $nomes)) {
                $nivel = (int) str_replace('andar-', '', $andar);

                // Verificar se tem o andar inferior
                if ($nivel === 1) {
                    // 1º andar precisa do térreo
                    if (! in_array('terreo', $nomes)) {
                        $validator->errors()->add('andares', 'Para ter o 1º andar, é necessário ter o térreo.');
                    }
                } else {
                    // Outros andares precisam do andar imediatamente inferior
                    $andarInferior = 'andar-'.($nivel - 1);
                    if (! in_array($andarInferior, $nomes)) {
                        $validator->errors()->add('andares', "Para ter o {$nivel}º andar, é necessário ter o ".($nivel - 1).'º andar.');
                    }
                }
            }
        }

        // Verificar subsolos
        if (in_array('subsolo-2', $nomes) && ! in_array('subsolo-1', $nomes)) {
            $validator->errors()->add('andares', 'Para ter o 2º subsolo, é necessário ter o subsolo.');
        }
    }

    /**
     * Formatar nome do andar para exibição.
     */
    protected function formatAndarName(string $nome): string
    {
        $formatMap = [
            'subsolo-2' => '2º Subsolo',
            'subsolo-1' => 'Subsolo',
            'terreo' => 'Térreo',
            'andar-1' => '1º Andar',
            'andar-2' => '2º Andar',
            'andar-3' => '3º Andar',
            'andar-4' => '4º Andar',
            'andar-5' => '5º Andar',
            'andar-6' => '6º Andar',
            'andar-7' => '7º Andar',
            'andar-8' => '8º Andar',
            'andar-9' => '9º Andar',
            'andar-10' => '10º Andar',
        ];

        return $formatMap[$nome] ?? $nome;
    }

    /**
     * Preparar dados para validação (transformar se necessário).
     */
    protected function prepareForValidation(): void
    {
        // Garantir que andares seja sempre um array
        if (! $this->has('andares') || ! is_array($this->input('andares'))) {
            $this->merge(['andares' => []]);
        }

        // Limpar dados vazios dos tipos de acesso
        $andares = $this->input('andares', []);
        foreach ($andares as $index => $andar) {
            if (isset($andar['tipo_acesso']) && is_array($andar['tipo_acesso'])) {
                $andares[$index]['tipo_acesso'] = array_filter($andar['tipo_acesso']);
            }
        }

        $this->merge(['andares' => $andares]);
    }
}
