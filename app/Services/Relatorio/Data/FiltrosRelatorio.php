<?php

declare(strict_types=1);

namespace App\Services\Relatorio\Data;

use Carbon\CarbonImmutable;

final readonly class FiltrosRelatorio
{
    public function __construct(
        public ?CarbonImmutable $dataInicio = null,
        public ?CarbonImmutable $dataFim = null,
        public ?array $situacoes = null,
        public ?array $turnos = null,
        public ?int $instituicaoId = null,
        public ?int $unidadeId = null,
        public ?int $moduloId = null,
        public ?int $andarId = null,
        public ?int $espacoId = null,
        public ?int $setorId = null,
        public ?array $agendaIds = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            dataInicio: isset($data['data_inicio']) ? CarbonImmutable::parse($data['data_inicio']) : null,
            dataFim: isset($data['data_fim']) ? CarbonImmutable::parse($data['data_fim']) : null,
            situacoes: $data['situacoes'] ?? null,
            turnos: $data['turnos'] ?? null,
            instituicaoId: isset($data['instituicao_id']) ? (int) $data['instituicao_id'] : null,
            unidadeId: isset($data['unidade_id']) ? (int) $data['unidade_id'] : null,
            moduloId: isset($data['modulo_id']) ? (int) $data['modulo_id'] : null,
            andarId: isset($data['andar_id']) ? (int) $data['andar_id'] : null,
            espacoId: isset($data['espaco_id']) ? (int) $data['espaco_id'] : null,
            setorId: isset($data['setor_id']) ? (int) $data['setor_id'] : null,
            agendaIds: $data['agenda_ids'] ?? null,
        );
    }

    public function resumo(): array
    {
        $resumo = [];

        if ($this->dataInicio !== null && $this->dataFim !== null) {
            $inicio = $this->dataInicio->format('d/m/Y');
            $fim = $this->dataFim->format('d/m/Y');
            $resumo['Período'] = "{$inicio} a {$fim}";
        } elseif ($this->dataInicio !== null) {
            $resumo['Período'] = "{$this->dataInicio->format('d/m/Y')} a —";
        } elseif ($this->dataFim !== null) {
            $resumo['Período'] = "— a {$this->dataFim->format('d/m/Y')}";
        }

        if ($this->situacoes !== null && ! empty($this->situacoes)) {
            $resumo['Situações'] = implode(', ', $this->situacoes);
        }

        if ($this->turnos !== null && ! empty($this->turnos)) {
            $resumo['Turnos'] = implode(', ', $this->turnos);
        }

        if ($this->instituicaoId !== null) {
            $resumo['Instituição'] = $this->instituicaoId;
        }

        if ($this->unidadeId !== null) {
            $resumo['Unidade'] = $this->unidadeId;
        }

        if ($this->moduloId !== null) {
            $resumo['Módulo'] = $this->moduloId;
        }

        if ($this->andarId !== null) {
            $resumo['Andar'] = $this->andarId;
        }

        if ($this->espacoId !== null) {
            $resumo['Espaço'] = $this->espacoId;
        }

        if ($this->setorId !== null) {
            $resumo['Setor'] = $this->setorId;
        }

        return $resumo;
    }
}
