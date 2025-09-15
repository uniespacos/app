<?php

namespace App\Jobs;

use App\Models\Reserva;
use App\Services\ConflictDetectionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ValidateReservationConflictsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Reserva $reserva)
    {
    }

    public function handle(ConflictDetectionService $conflictService): void
    {
        try {
            // 1. Marca a reserva como "processando"
            $this->reserva->update(['validation_status' => 'processing']);

            // 2. Executa a lógica de detecção de conflitos (usando nosso serviço otimizado)
            $conflitos = $conflictService->findConflictsFor($this->reserva->id);

            // 3. Salva o resultado no cache da reserva
            $this->reserva->update([
                'conflict_cache' => $conflitos,
                'validation_status' => 'completed',
            ]);

        } catch (Throwable $e) {
            Log::error("Falha ao validar conflitos para reserva ID {$this->reserva->id}: " . $e->getMessage());
            $this->reserva->update(['validation_status' => 'failed']);
            $this->fail($e);
        }
    }
}